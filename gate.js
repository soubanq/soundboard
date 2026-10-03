// Passkey gate. Casual keep-out only: this is a static site, so the check runs in the browser
// and the clip files themselves remain public URLs. Only a hash of the passkey is stored here.
(() => {
  const HASH = 'e07fefe658f01b952e74113e3bf3723d17234d0e11574c3add1280a49419d07a';
  const KEY = 'sijj-passkey-ok';
  const read = () => { try { return localStorage.getItem(KEY) === HASH; } catch { return false; } };
  const remember = () => { try { localStorage.setItem(KEY, HASH); } catch {} };
  if (read()) return;

  document.documentElement.classList.add('locked');

  const sha256 = async text => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))]
    .map(b => b.toString(16).padStart(2, '0')).join('');

  const realTitle = document.title;
  document.title = 'Enter passkey';

  addEventListener('DOMContentLoaded', () => {
    const gate = document.createElement('div');
    gate.id = 'gate';
    gate.innerHTML = `
      <form class="gate-box" autocomplete="off">
        <div class="gate-title">RESTRICTED ACCESS</div>
        <div class="gate-sub">ENTER PASSKEY</div>
        <input type="password" id="gate-input" placeholder="••••••••" autocapitalize="off" autocorrect="off" spellcheck="false" autofocus>
        <button class="btn-hw" type="submit">Unlock</button>
        <div class="gate-err" id="gate-err"></div>
      </form>`;
    document.body.append(gate);
    const input = gate.querySelector('input');
    input.focus();
    gate.querySelector('form').onsubmit = async e => {
      e.preventDefault();
      if (await sha256(input.value.trim().toLowerCase()) === HASH) {
        remember();
        document.documentElement.classList.remove('locked');
        document.title = realTitle;
        gate.remove();
      } else {
        gate.querySelector('#gate-err').textContent = 'WRONG PASSKEY';
        gate.querySelector('.gate-box').classList.remove('shake');
        void gate.offsetWidth;
        gate.querySelector('.gate-box').classList.add('shake');
        input.select();
      }
    };
  });
})();
