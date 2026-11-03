# Patient Management

FastAPI backend (JSON file storage) with a plain HTML/CSS/JS frontend.

```
patient_management_starter/
├── main.py            # FastAPI backend
├── patients.json      # data store
├── requirements.txt
└── frontend/          # index.html, style.css, script.js
```

## Run on Windows / VS Code

1. In VS Code choose **File → Open Folder** and select the folder that directly contains `main.py`.
2. Open **Terminal → New Terminal** and create a virtual environment:
   ```powershell
   py -m venv .venv
   ```
3. Activate it (if PowerShell blocks scripts, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first):
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```
4. Install dependencies:
   ```powershell
   python -m pip install --upgrade pip
   python -m pip install -r requirements.txt --default-timeout=300 --retries=10
   ```
5. Start the server:
   ```powershell
   python -m uvicorn main:app --reload
   ```
6. Open the website at **http://127.0.0.1:8000/app** (API docs: http://127.0.0.1:8000/docs). Stop with Ctrl+C.

macOS / Linux: use `python3 -m venv .venv` and `source .venv/bin/activate`.

### Optional: run the frontend separately
The backend already allows CORS from port 5500. In a second terminal:
```powershell
python -m http.server 5500 --directory frontend
```
Then open http://127.0.0.1:5500.


