use rdev::{listen, Event};
use tauri::{AppHandle, Manager};
use tauri::{Emitter, PhysicalPosition};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Shortcut, ShortcutState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    fn callback(event: Event, app_handle: AppHandle) {
        match event.event_type {
            rdev::EventType::ButtonRelease(rdev::Button::Left) => {
                app_handle.emit("increment", ()).unwrap();
            }
            // NOTE: The below doesn't seem to work properly on windows (when the app has focus)
            // rdev::EventType::KeyPress(rdev::Key::Plus) => {
            //     app_handle.emit("increment", ()).unwrap();
            // }
            // rdev::EventType::KeyPress(rdev::Key::Minus) => {
            //     app_handle.emit("decrement", ()).unwrap();
            // }
            _ => (),
        }
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            let app_handle = app.handle().clone();

            // spawn the window in the top right, 20% of the horizontal axis and 50% of the vertical
            if let Ok(Some(monitor)) = window.current_monitor() {
                let screen_size: &tauri::PhysicalSize<u32> = monitor.size();
                let new_width = (screen_size.width as f64 * 0.2) as u32;
                let new_height = (screen_size.height as f64 * 0.5) as u32;
                let new_x = screen_size.width - new_width;
                let new_y = 0;

                let _ = window.set_size(tauri::Size::Physical(tauri::PhysicalSize::new(
                    new_width, new_height,
                )));
                let _ = window.set_position(PhysicalPosition::new(new_x, new_y));

                // window is hidden by default, show once in the correct position
                window.show().unwrap();
            }

            #[cfg(desktop)]
            {
                let shortcuts = [
                    (Shortcut::new(None, Code::Minus), "decrement"),
                    (Shortcut::new(None, Code::Equal), "increment"),
                ];

                let app_handle = app.handle();
                app_handle.plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |_app, shortcut, event| {
                            if let ShortcutState::Pressed = event.state() {
                                for (key, action) in &shortcuts {
                                    if shortcut == key {
                                        _app.emit(action, ()).unwrap();
                                    }
                                }
                            }
                        })
                        .build(),
                )?;

                for (shortcut, _) in &shortcuts {
                    app.global_shortcut().register(shortcut.clone())?;
                }
            }

            // handle the scaling issues on windows
            #[cfg(windows)]
            {
                let main_window = app.get_webview_window("main").unwrap();
                let sf = main_window.scale_factor().unwrap();
                let _ = main_window.with_webview(move |webview| {
                    unsafe {
                        // see https://docs.rs/webview2-com/0.19.1/webview2_com/Microsoft/Web/WebView2/Win32/struct.ICoreWebView2Controller.html
                        webview.controller().SetZoomFactor(1.0 / sf).unwrap();
                    }
                });
            }

            // the thread that listens to mouse clicks
            std::thread::spawn(move || {
                if let Err(error) = listen(move |event| callback(event, app_handle.clone())) {
                    println!("Error: {:?}", error)
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
