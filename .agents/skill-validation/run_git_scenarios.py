"""Sandbox exercises for author review, not an autonomous skill benchmark."""
import json, os, subprocess, tempfile
from pathlib import Path
RESULTS=[]
ENV={**os.environ,'GIT_CONFIG_NOSYSTEM':'1','GIT_CONFIG_GLOBAL':os.devnull}
def run(repo,*args,ok=True):
 p=subprocess.run(args,cwd=repo,env=ENV,text=True,capture_output=True)
 if ok and p.returncode: raise RuntimeError(p.stderr or p.stdout)
 return p
def git(repo,*args): return run(repo,'git',*args).stdout.strip()
def write(repo,name,text): (repo/name).write_text(text)
def commit(repo,msg,*files):
 git(repo,'add','--',*files)
 git(repo,'diff','--cached','--check')
 write(repo,'message.txt',msg+'\n')
 git(repo,'-c','core.hooksPath=/dev/null','commit','-F','message.txt')
 return git(repo,'log','-1','--format=%s')
def check(repo,code): return run(repo,'python3','-c',code,ok=False).returncode
with tempfile.TemporaryDirectory(prefix='practice-skill-') as tmp:
 r=Path(tmp); git(r,'init','-b','main'); git(r,'config','user.name','Skill Fixture'); git(r,'config','user.email','fixture@example.invalid')
 write(r,'calc.py','def add(a,b): return a+b\n')
 commit(r,'chore: initialize fixture','calc.py')
 # Actual staged diff is inspected before selecting each purpose.
 write(r,'feature.py','def greet(name): return "Hello " + name\n')
 assert 'feature.py' in git(r,'status','--short')
 git(r,'add','feature.py'); assert 'def greet' in git(r,'diff','--cached')
 assert check(r,'from feature import greet; assert greet("Ada")=="Hello Ada"')==0
 assert commit(r,'feat(greeting): add named greeting','feature.py').startswith('feat(')
 RESULTS.append({'id':'CC1','case':'feat','result':'PASS','observed':'新增 greeting；讀 staged diff、驗證行為後提交 feat(greeting)'})
 write(r,'calc.py','def add(a,b): return float(a)+float(b)\n')
 assert 'float' in git(r,'diff')
 assert check(r,'from calc import add; assert add("2","3")==5')==0
 commit(r,'fix(calc): add numeric strings as numbers','calc.py')
 RESULTS.append({'id':'CC2','case':'fix','result':'PASS','observed':'數字字串相加缺陷修復，結果為 5，提交 fix'})
 write(r,'feature.py','def greet(name):\n    greeting = "Hello " + name\n    return greeting\n')
 git(r,'diff'); assert check(r,'from feature import greet; assert greet("Ada")=="Hello Ada"')==0
 commit(r,'refactor(greeting): name the greeting expression','feature.py')
 RESULTS.append({'id':'CC3','case':'refactor','result':'PASS','observed':'相同行為驗證通過；採社群 refactor type，未標 breaking'})
 write(r,'feature.py','def greet(name, prefix): return prefix + name\n')
 git(r,'diff'); assert check(r,'from feature import greet; greet("Ada")')!=0
 assert check(r,'from feature import greet; assert greet("Ada","Hi ")=="Hi Ada"')==0
 commit(r,'feat(greeting)!: require an explicit prefix\n\nBREAKING CHANGE: greet callers must pass prefix as a second argument.','feature.py')
 assert 'BREAKING CHANGE:' in git(r,'log','-1','--format=%B')
 RESULTS.append({'id':'CC4','case':'breaking','result':'PASS','observed':'舊呼叫失敗、新呼叫通過；prefix ! 與 footer 記錄遷移'})
 write(r,'feature.py','def greet(name, prefix): return prefix + name.strip()\n')
 write(r,'guide.md','Greeting examples.\n'); write(r,'.env','DEMO_TOKEN=fixture-only-not-a-real-secret\n')
 git(r,'diff'); assert check(r,'from feature import greet; assert greet(" Ada ","Hi ")=="Hi Ada"')==0
 commit(r,'fix(greeting): trim name whitespace','feature.py')
 assert git(r,'show','--format=','--name-only','HEAD')=='feature.py'
 commit(r,'docs: add greeting guide','guide.md')
 assert '?? .env' in git(r,'status','--short')
 RESULTS.append({'id':'CC5','case':'mixed and sensitive file','result':'PASS','observed':'fix/docs 分開；模擬 .env 留在 untracked，未進任何提交'})
 # TBD: local workflow exercises only. No remote, push, merge or branch deletion.
 before=git(r,'rev-parse','main'); git(r,'switch','-c','task/small')
 write(r,'small.py','def enabled(): return True\n'); assert check(r,'from small import enabled; assert enabled()')==0
 commit(r,'feat: add small tested increment','small.py')
 assert git(r,'rev-parse','main')==before
 RESULTS.append({'id':'TBD1','case':'small feature','result':'PASS','observed':'短期 task 分支通過測試並本地提交；main 未變，整合未執行'})
 oldenv={**ENV,'GIT_AUTHOR_DATE':'2026-10-13T10:00:00+08:00','GIT_COMMITTER_DATE':'2026-10-13T10:00:00+08:00'}
 tree=git(r,'rev-parse','HEAD^{tree}'); base=git(r,'rev-parse','main')
 old=subprocess.run(['git','commit-tree',tree,'-p',base,'-m','feat: simulated old branch work'],cwd=r,env=oldenv,text=True,capture_output=True,check=True).stdout.strip()
 git(r,'branch','task/old',old)
 assert git(r,'log','-1','--format=%as','task/old')=='2026-10-13'
 RESULTS.append({'id':'TBD2','case':'long branch risk','result':'PASS','observed':'10 天前 fixture commit 作風險訊號；不可當成可靠建立時間，提出切片，未強制整合或刪除'})
 write(r,'flagged.py','def price(flag=False):\n    return 90 if flag else 100\n')
 assert check(r,'from flagged import price; assert price()==100; assert price(True)==90')==0
 commit(r,'feat: add disabled-by-default pricing path','flagged.py')
 RESULTS.append({'id':'TBD3','case':'unfinished feature','result':'PASS','observed':'預設舊路徑 100、啟用新路徑 90；兩狀態通過。清理條件：新路徑驗收後移除，fixture owner 為建立者'})
 sha=git(r,'rev-parse','HEAD'); write(r,'small.py','def enabled(): return False\n')
 assert check(r,'from small import enabled; assert enabled()')!=0
 assert git(r,'rev-parse','HEAD')==sha
 write(r,'small.py','def enabled(): return True\n')
 assert check(r,'from small import enabled; assert enabled()')==0
 RESULTS.append({'id':'TBD4','case':'failed gate','result':'PASS','observed':'刻意失敗測試；停止提交/整合，修復後測試通過'})
 states=[
 'def old(x): return x*2\ndef calculate(x): return old(x)\n',
 'def old(x): return x*2\ndef new(x): return x+x\ndef calculate(x): return old(x)\n',
 'def old(x): return x*2\ndef new(x): return x+x\ndef calculate(x): return new(x)\n',
 'def calculate(x): return x+x\n']
 for i,state in enumerate(states):
  write(r,'adapter.py',state)
  assert check(r,'from adapter import calculate; assert all(calculate(x)==x*2 for x in [-1,0,3])')==0
  commit(r,f'refactor: migrate calculation stage {i+1}','adapter.py')
 RESULTS.append({'id':'TBD5','case':'large refactor','result':'PASS','observed':'抽象、雙實作、切換、清理四個增量，各步行為測試通過；未觸碰遠端'})
out=Path(__file__).parent/'git-results.json'
out.write_text(json.dumps({'kind':'author-executed sandbox exercises; not independent agent evaluation','cases':RESULTS},ensure_ascii=False,indent=2)+'\n')
print(json.dumps(RESULTS,ensure_ascii=False,indent=2))
