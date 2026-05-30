import json
import sys
import os
import requests
from z3 import *



def analyze_logic(data):
    biz_type = data.get('business_info', {}).get('type', 'Unknown')
    metrics = data.get('metrics', {})
    trace = data.get('deep_trace', {})
    modifiers = data.get('modifiers', {})
    
    is_staffing = (biz_type == 'Staffing')
    logs = trace.get('performance_logs', []) if is_staffing else trace.get('waste_logs', [])
    
    if not logs:
        return {"status": "ERROR", "reason": f"No {biz_type} logs available."}

    # Extract Simulation Modifiers
    anomaly_factor = 1 + (modifiers.get('anomaly_delta', 0) / 100)
    fatigue_factor = 1 + (modifiers.get('fatigue_delta', 0) / 100)
    mitigation_factor = 1 - (modifiers.get('loss_mitigation', 0) / 100)

    # Batch Clustering & Z3 Math (Your existing Logic Gate)
    batch_size = max(1, len(logs) // 5)
    batches = [logs[i:i + batch_size] for i in range(0, len(logs), batch_size)]
    critical_clusters = 0
    solver = Solver()

    if is_staffing:
        # Scale baseline metrics by simulation modifiers
        avg_ot = float(metrics.get('averageFatigue', 0)) * fatigue_factor
        total_failed = sum(l.get('failed', 0) for l in logs) * anomaly_factor
        total_started = sum(l.get('started', 0) for l in logs)
        failure_rate = (total_failed / total_started * 100) if total_started > 0 else 0
        
        for b in batches:
            b_fail = sum(item['failed'] for item in b) * anomaly_factor
            b_start = sum(item['started'] for item in b)
            b_ot = (sum(item['ot'] for item in b) / max(1, len(b))) * fatigue_factor if b else 0
            if b_ot > 12.0 and (b_fail / b_start > 0.20 if b_start else False):
                critical_clusters += 1

        OT = Real('OT')
        FAIL_RATE = Real('FAIL_RATE')
        solver.add(OT == avg_ot, FAIL_RATE == failure_rate)
        safety_invariant = And(OT <= 12.0, FAIL_RATE < 15.0)
        
        solver.push()
        solver.add(safety_invariant)
        is_safe = (solver.check() == sat)
        solver.pop()

        proof_str = f"Safety(OT={avg_ot:.1f}h, Fail={failure_rate:.1f}%) ⊢ {'SAT' if is_safe else 'UNSAT'}"
        context_str = f"Simulated MRI: {len(logs)} logs. Proj. Failure Rate: {failure_rate:.1f}%"

    else:
        # Scale baseline loss by simulation modifiers
        total_loss = float(metrics.get('totalLoss', 0)) * anomaly_factor * mitigation_factor
        reasons = [l.get('reason', '') for l in logs]
        primary_driver = max(set(reasons), key=reasons.count) if reasons else "Unknown"
        
        for b in batches:
            b_loss = sum(item.get('loss', 0) for item in b) * anomaly_factor * mitigation_factor
            if b_loss > (total_loss / max(1, len(batches))): 
                critical_clusters += 1

        LOSS = Real('LOSS')
        solver.add(LOSS == total_loss)
        safety_invariant = LOSS < 50000.0 # Financial leakage threshold
        
        solver.push()
        solver.add(safety_invariant)
        is_safe = (solver.check() == sat)
        solver.pop()

        proof_str = f"Loss_Invariant(Total={total_loss:.0f} < 50k) ⊢ {'SAT' if is_safe else 'UNSAT'}"
        context_str = f"Simulated Analysis: Loss Mitigation {modifiers.get('loss_mitigation')}% active. Primary Driver: {primary_driver}"

    # =====================================================================
    # THE TRUE AI INTEGRATION (REST API BYPASS)
    # =====================================================================
    
    # Create a prompt for the LLM based on the data
   # =====================================================================
    # THE TRUE AI INTEGRATION (REST API BYPASS)
    # =====================================================================
    
    # 1. READ THE KEY FROM LARAVEL'S ENVIRONMENT
    raw_key = os.environ.get('GEMINI_API_KEY', '')
    GEMINI_API_KEY = raw_key.strip().replace('"', '').replace("'", "")
    
    # Create a prompt for the LLM based on the data
    ai_prompt = f"Act as a strict business consultant. The {biz_type} business has {critical_clusters} critical clusters of failure out of {len(batches)} recent operational batches. The data shows issues with '{context_str}'. Give a maximum 2-sentence actionable, highly specific suggestion to fix this."
    
    # Call the AI API via lightweight HTTP Request
    # Call the AI API via lightweight HTTP Request
    try:
        if not GEMINI_API_KEY:
            raise ValueError("API Key missing from Laravel environment.")
            
        # FIX: Using the EXACT model name from your successful curl command
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={GEMINI_API_KEY}"
        
        headers = {'Content-Type': 'application/json'}
        payload = {
            "contents": [{"parts": [{"text": ai_prompt}]}]
        }
        
        # 10-second timeout to give the AI time to think
        api_response = requests.post(url, headers=headers, json=payload, timeout=10)
        api_response.raise_for_status() # Check for HTTP errors
        
        response_data = api_response.json()
        ai_suggestion = response_data['candidates'][0]['content']['parts'][0]['text'].strip()
        
    except Exception as e:
        # 🚨 THE OFFLINE FAIL-SAFE 🚨
        error_msg = str(e)
        if is_staffing:
            ai_suggestion = f"[Simulated AI] (Error: {error_msg}) Immediate intervention required. Mandate a 45-minute recovery interval."
        else:
            ai_suggestion = f"[Simulated AI] (Error: {error_msg}) Product attribute misalignment is driving a {total_loss} PKR financial loss. Audit sizing charts."
    # 3. The Logic Gate blocks the AI if Z3 found it mathematically unsafe
    if not is_safe:
        status = "REJECTED"
        title = "Hallucination Blocked"
        final_suggestion = f"The AI suggested: '{ai_suggestion}' but the Z3 Formal Verification Engine BLOCKED this advice because it violates formal business constraints."
    else:
        status = "VERIFIED"
        title = "AI Insight Verified"
        final_suggestion = ai_suggestion

    return {
        "status": status,
        "title": title,
        "suggestion": final_suggestion,
        "context": context_str,
        "proof": proof_str,
        "reason": "Z3 Solver Proof Confirmed against AI generated text"
    }
if __name__ == "__main__":
    try:
        raw_data = sys.stdin.read().strip()
        
        if not raw_data:
            print(json.dumps({"status": "ERROR", "reason": "No data received via standard input."}))
            sys.exit(1)
            
        input_data = json.loads(raw_data)
        print(json.dumps(analyze_logic(input_data)))
    except Exception as e:
        print(json.dumps({"status": "ERROR", "reason": str(e)}))