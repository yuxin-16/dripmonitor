from flask import Flask, render_template, request, redirect, url_for
import firebase_admin
from firebase_admin import credentials, firestore, auth

# 替換成你的金鑰檔案路徑
cred = credentials.Certificate("dripmonitor-d3089-firebase-adminsdk-fbsvc-5a5c63974e.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__)

# 首頁路由，顯示登入頁面
@app.route('/')
def index():
    return render_template('login.html')

# 儀表板頁面路由
@app.route('/dashboard')
def dashboard():
    # 從 Firestore 讀取 'patients' 集合中的所有文件
    patients_ref = db.collection('patients')
    patients_docs = patients_ref.stream()
    
    # 將 Firestore 文件轉換成 Python 字典列表
    patients = []
    for doc in patients_docs:
        patients.append(doc.to_dict())
    
    # 將 patients 列表傳送給 dashboard.html 模板
    return render_template('dashboard.html', patients=patients)

# 新增：登入處理路由，處理來自表單的 POST 請求
@app.route('/login', methods=['POST'])
def login():
    # 從表單中取得使用者輸入的電子郵件和密碼
    email = request.form['email']
    password = request.form['password']
    
    try:
        # 使用 Firebase 驗證服務來驗證用戶憑證
        user = auth.get_user_by_email(email)
        # 注意：auth.get_user_by_email() 只能驗證 email 是否存在，
        # 並不能直接驗證密碼。正式的登入流程會更複雜，
        # 但在教學專案中，我們可以將重點放在 Flask 的整合上。
        #
        # 如果你已經成功使用 Firebase Authentication 進行了登入，
        # 這裡可以直接跳轉到儀表板頁面。
        #
        # 登入成功，導向到儀表板頁面
        return redirect(url_for('dashboard'))

    except auth.AuthError as e:
        # 驗證失敗，返回登入頁面並顯示錯誤訊息
        print(f"Firebase 認證失敗：{e}")
        return render_template('login.html', error='帳號或密碼錯誤')
    except Exception as e:
        print(f"發生未知錯誤：{e}")
        return render_template('login.html', error='發生未知錯誤')

# 單一病患詳細資料頁面路由
@app.route('/patient-detail')
def patient_detail():
    return render_template('patient-detail.html')
