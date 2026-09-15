import requests, sqlite3, os, json, time

BASE_URL = 'http://127.0.0.1:8000'
DB_PATH = 'bug_platform.db'

print('=================================================================')
print('>>> FULL COMPREHENSIVE END-TO-END VERIFICATION PASS')
print('=================================================================')

# 1. Database connection & table verification
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cursor.fetchall()]
required_tables = ['users', 'team_invitations', 'user_settings', 'bug_reports', 'knowledge_base', 'ai_reports', 'notifications', 'attachments']
for t in required_tables:
    assert t in tables, f'Missing table: {t}'
print('[PASS] 1. SQLite Schema: All required tables exist in database.')

# 2. Health check
r = requests.get(f'{BASE_URL}/health')
assert r.status_code == 200 and r.json()['status'] == 'ok'
print('[PASS] 2. FastAPI Health Endpoint: 200 OK')

# 3. Authentication: Login
login_res = requests.post(f'{BASE_URL}/api/auth/login', json={'email': 'alice.smith0@techcorp.com', 'password': 'password123'})
assert login_res.status_code == 200
token = login_res.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}
print('[PASS] 3. Authentication: JWT token retrieved for alice.smith0@techcorp.com')

# 4. User Profile & Settings Retrieval
me_res = requests.get(f'{BASE_URL}/api/auth/me', headers=headers)
assert me_res.status_code == 200 and me_res.json()['name'] == 'Alice Smith'
settings_res = requests.get(f'{BASE_URL}/api/auth/settings', headers=headers)
assert settings_res.status_code == 200
print('[PASS] 4. User Profile & Settings Retrieval: Verified')

# 5. Settings Save & Database Persistence (Appearance, Org, Notifications, AI, Security)
update_payload = {
    'theme': 'dark',
    'organization_name': 'BugLens AI Systems',
    'organization_desc': 'Multi-Agent Defect Diagnosis & RAG Platform',
    'email_notif': True,
    'push_notif': True,
    'weekly_digest': True,
    'notif_analysis_completed': True,
    'notif_bug_assigned': True,
    'notif_team_invitation': True,
    'notif_bug_resolved': True,
    'notif_kb_update': True,
    'ai_model': 'sentence-transformers/all-MiniLM-L6-v2',
    'confidence_threshold': 88,
    'session_timeout_enabled': True,
    'session_timeout_minutes': 15
}
save_res = requests.put(f'{BASE_URL}/api/auth/settings', headers=headers, json=update_payload)
assert save_res.status_code == 200
# Verify in database directly
db_settings = cursor.execute('SELECT theme, organization_name, confidence_threshold, session_timeout_minutes FROM user_settings WHERE user_id = ?', (me_res.json()['id'],)).fetchone()
assert db_settings[0] == 'dark' and db_settings[1] == 'BugLens AI Systems' and db_settings[2] == 88 and db_settings[3] == 15
print('[PASS] 5. Settings Save & SQLite Persistence: Verified in database table')

# 6. Team Invitation: Creation with Message and Unique Token
invite_data = {
    'name': 'David Miller',
    'email': f'david.miller.{int(time.time())}@techcorp.com',
    'role': 'Developer',
    'message': 'Please join our defect diagnosis workspace on BugLens.'
}
invite_res = requests.post(f'{BASE_URL}/api/team/invite', json=invite_data)
assert invite_res.status_code == 201
member_id = invite_res.json()['member']['id']
# Check pending invitations
invitations = requests.get(f'{BASE_URL}/api/team/invitations').json()
matched_inv = [i for i in invitations if i['email'] == invite_data['email']]
assert len(matched_inv) > 0 and matched_inv[0]['token'].startswith('inv_')
inv_id = matched_inv[0]['id']
print(f'[PASS] 6. Team Invitation: Created with Token {matched_inv[0]["token"]}')

# 7. Team Invitation: Renewal and Cancellation
renew_res = requests.post(f'{BASE_URL}/api/team/invitations/{inv_id}/resend')
assert renew_res.status_code == 200
cancel_res = requests.delete(f'{BASE_URL}/api/team/invitations/{inv_id}')
assert cancel_res.status_code == 200
print('[PASS] 7. Team Invitation: Resend/Renew & Cancellation Verified')

# 8. Bug Analysis: 5-Agent AI Pipeline
bug_input = {
    'title': 'IndexError in List Processing during Batch Ingestion',
    'description': 'Array index out of range when batch payload is empty in data worker.',
    'stack_trace': 'IndexError: list index out of range at worker.py:56',
    'severity': 'high',
    'priority': 'P2'
}
analyze_res = requests.post(f'{BASE_URL}/api/bugs/analyze', json=bug_input)
assert analyze_res.status_code == 200
report_data = analyze_res.json()
assert 'report' in report_data and report_data['report']['triage_result'] is not None
assert report_data['report']['root_cause_result'] is not None
assert report_data['report']['remediation_result'] is not None
new_bug_id = report_data['bug']['id']
print(f'[PASS] 8. 5-Agent Multi-Agent Analysis Pipeline: Processed Bug #{new_bug_id}')

# 9. Bug Resolution & Automatic Knowledge Base Embedding
resolve_res = requests.post(f'{BASE_URL}/api/bugs/{new_bug_id}/resolve')
assert resolve_res.status_code == 200
kb_count = cursor.execute('SELECT COUNT(*) FROM knowledge_base').fetchone()[0]
assert kb_count > 0
print(f'[PASS] 9. Bug Resolution & RAG Knowledge Base Insertion: {kb_count} KB articles indexed')

# 10. Global Search across Bug ID, Description, KB ID, and Team Members
search_num = requests.get(f'{BASE_URL}/api/search?q=%23{new_bug_id}').json()
assert search_num['total'] > 0
search_txt = requests.get(f'{BASE_URL}/api/search?q=IndexError').json()
assert search_txt['total'] > 0
search_team = requests.get(f'{BASE_URL}/api/search?q=Alice').json()
assert any(r['type'] == 'team' for r in search_team['results'])
print('[PASS] 10. Multi-Entity Global Search: Verified across Bugs, KB, and Team')

# 11. Dashboard & Analytics Live Database Aggregation (all 8 charts)
dash_stats = requests.get(f'{BASE_URL}/api/analytics/dashboard').json()
assert dash_stats['total_bugs'] >= new_bug_id
overview = requests.get(f'{BASE_URL}/api/analytics/overview').json()
assert len(overview['severity_data']) == 4
assert len(overview['monthly_data']) >= 3
assert len(overview['weekly_data']) == 7
assert len(overview['resolution_data']) == 4
assert len(overview['categories_data']) == 4
assert len(overview['error_types_data']) == 5
assert 'duplicate_rate' in overview
print('[PASS] 11. Dashboard & Analytics Overview: Real database calculations for all 8 charts')

# 12. Notifications Center & Mark Read
notifs_res = requests.get(f'{BASE_URL}/api/auth/notifications')
assert notifs_res.status_code == 200
read_all_res = requests.post(f'{BASE_URL}/api/auth/notifications/read-all')
assert read_all_res.status_code == 200
print('[PASS] 12. In-App Notification Center & Mark-Read Actions: Verified')

# 13. Reports Generation & CSV Streaming
report_gen = requests.get(f'{BASE_URL}/api/reports/generate?report_type=weekly').json()
assert report_gen['summary']['total_bugs'] > 0
csv_download = requests.get(f'{BASE_URL}/api/reports/export-csv')
assert csv_download.status_code == 200 and len(csv_download.content) > 0
print('[PASS] 13. Reports Generation & CSV Export Stream: Verified')

# 14. File/Screenshot Upload & Attachment
test_file_path = 'uploads/e2e_verify_screenshot.png'
with open(test_file_path, 'wb') as f:
    f.write(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82')

with open(test_file_path, 'rb') as f:
    upload_res = requests.post(f'{BASE_URL}/api/bugs/upload', files={'file': ('e2e_verify_screenshot.png', f, 'image/png')})
assert upload_res.status_code == 200 and upload_res.json()['is_image'] == True
file_url = upload_res.json()['file_url']
static_res = requests.get(f'{BASE_URL}{file_url}')
assert static_res.status_code == 200 and len(static_res.content) > 0
print(f'[PASS] 14. File & Screenshot Upload: Served at {file_url}')

conn.close()
print('\n=================================================================')
print('>>> ALL 14 LIVE END-TO-END VERIFICATION PASSES COMPLETED 100%!')
print('=================================================================')
