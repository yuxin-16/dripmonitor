from firebase_functions import https_fn
from firebase_admin import initialize_app

# 引入你的 Flask 應用程式
from app import app as flask_app

# 初始化 Firebase Admin SDK
initialize_app()

# 將你的 Flask 應用程式包裝成一個 HTTP 觸發的 Cloud Function
@https_fn.on_request()
def flask_app_trigger(req: https_fn.Request) -> https_fn.Response:
    # 這行程式碼讓 Flask 應用程式可以處理進來的 HTTP 請求
    return flask_app.full_dispatch_request()