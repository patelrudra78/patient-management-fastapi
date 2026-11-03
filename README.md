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

## Common fixes
- `requirements.txt` not found: the terminal is in the wrong folder. Open the folder that directly contains `main.py`.
- `No module named fastapi`: make sure `(.venv)` shows in the terminal, then reinstall requirements.
- `Could not import module "main"`: run `python -c "import main"` and read the error.
- Page says it cannot reach the backend: the server is not running or is on a different port.
- Data is saved in `patients.json`; copy it before manual edits. Height is in metres (1.75), weight in kilograms (72).

## Endpoints
GET `/`, GET `/patients`, GET `/patient/{patient_id}`, POST `/patients`, PUT `/patient/{patient_id}`, DELETE `/patient/{patient_id}`, GET `/sort?sort_by=age&order=asc`, frontend at `/app`.

## Upload to GitHub
```powershell
git init
git add .
git commit -m "Patient management app"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```
Create the empty repository on github.com first (no README or .gitignore). `patients.json` is committed, so remove any real patient data before pushing.
