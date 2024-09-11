use rdev::{listen, Event};
use tauri::{AppHandle, Manager};
use tauri::{Emitter, PhysicalPosition};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    fn callback(event: Event, app_handle: AppHandle) {
        match event.event_type {
            rdev::EventType::ButtonRelease(rdev::Button::Left) => {
                app_handle.emit("increment", ()).unwrap();
            }
            rdev::EventType::KeyPress(rdev::Key::Minus) => {
                app_handle.emit("decrement", ()).unwrap();
            }
            _ => (),
        }
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            println!("Starting");

            #[cfg(windows)]
            {
                // handle the scaling issues on windows
                let main_window = app.get_webview_window("main").unwrap();
                let sf = main_window.scale_factor().unwrap();
                let _ = main_window.with_webview(move |webview| {
                    unsafe {
                        // see https://docs.rs/webview2-com/0.19.1/webview2_com/Microsoft/Web/WebView2/Win32/struct.ICoreWebView2Controller.html
                        webview.controller().SetZoomFactor(0.8 / sf).unwrap();
                    }
                });
            }

            let window = app.get_webview_window("main").unwrap();
            let app_handle = app.handle().clone(); // Clone the AppHandle

            if let Ok(Some(monitor)) = window.current_monitor() {
                let screen_size: &tauri::PhysicalSize<u32> = monitor.size();
                let new_width = (screen_size.width as f64 * 0.2) as u32; // Set width to 20% of screen width
                let window_size = window.inner_size().unwrap();
                let new_x = screen_size.width - new_width;
                let y = 0;

                let _ = window.set_size(tauri::Size::Physical(tauri::PhysicalSize::new(
                    new_width,
                    window_size.height,
                )));
                let _ = window.set_position(PhysicalPosition::new(new_x, y));
            }

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
