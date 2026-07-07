(function () {
  const cfg = window.euforiaPuntos;
  if (!cfg) return;

  const app = document.getElementById('euforia-puntos-app');
  if (!app) return;

  const form = document.getElementById('ep-lookup-form');
  const dniInput = document.getElementById('ep-dni');
  const alertEl = document.getElementById('ep-alert');
  const dashboard = document.getElementById('ep-dashboard');
  const balanceEl = document.getElementById('ep-balance');
  const balanceDniEl = document.getElementById('ep-balance-dni');
  const rewardsEl = document.getElementById('ep-rewards');
  const historyEl = document.getElementById('ep-history');
  const lookupBtn = document.getElementById('ep-lookup-btn');

  let currentDni = '';
  let rewardsCache = [];

  function showAlert(message, type) {
    alertEl.textContent = message;
    alertEl.classList.remove('ep-hidden', 'is-success');
    if (type === 'success') {
      alertEl.classList.add('is-success');
    }
  }

  function hideAlert() {
    alertEl.classList.add('ep-hidden');
    alertEl.classList.remove('is-success');
  }

  function normalizeDni(value) {
    const digits = String(value || '').replace(/\D/g, '');
    if (digits.length < 6 || digits.length > 10) return null;
    return digits.replace(/^0+/, '') || '0';
  }

  async function apiGet(path) {
    const res = await fetch(cfg.restUrl + path, { credentials: 'same-origin' });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || cfg.strings.redeemError);
    }
    return data;
  }

  async function apiPost(path, body) {
    const res = await fetch(cfg.restUrl + path, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': cfg.nonce,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || cfg.strings.redeemError);
    }
    return data;
  }

  function rewardVisualHtml(reward) {
    if (reward.visual_type === 'image' && reward.image_url) {
      return '<div class="ep-reward-visual"><img src="' + escapeHtml(reward.image_url) + '" alt="' + escapeHtml(reward.title) + '"></div>';
    }

    var iconClass = 'ep-reward-icon is-' + escapeHtml(reward.icon || 'gift');
    var badge = reward.badge_text
      ? escapeHtml(reward.badge_text)
      : (reward.icon === 'merch' ? '🎁' : '★');

    if (reward.icon === 'percent') {
      badge = '<svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 5L5 19M9 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><span>' + badge + '</span>';
      iconClass += ' ep-icon-stack';
    } else if (reward.icon === 'fixed') {
      badge = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v18M7 8c0-2.2 2.2-4 5-4s5 1.8 5 4-2.2 4-5 4H9c-2.8 0-5 1.8-5 4s2.2 4 5 4 5-1.8 5-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>' + badge + '</span>';
      iconClass += ' ep-icon-stack';
    } else if (reward.icon === 'merch') {
      badge = '🎁';
    }

    return '<div class="ep-reward-visual"><div class="' + iconClass + '">' + badge + '</div></div>';
  }

  function renderRewards(balance) {
    rewardsEl.innerHTML = '';
    if (!rewardsCache.length) {
      rewardsEl.innerHTML = '<p>' + 'No hay premios disponibles por ahora.' + '</p>';
      return;
    }

    rewardsCache.forEach(function (reward) {
      const card = document.createElement('article');
      const canRedeem = balance >= reward.points_cost;
      card.className = 'ep-reward-card' + (canRedeem ? '' : ' is-disabled');

      card.innerHTML =
        rewardVisualHtml(reward) +
        '<div class="ep-reward-body">' +
        '<span class="ep-reward-benefit">' + escapeHtml(reward.benefit_label) + '</span>' +
        '<h4>' + escapeHtml(reward.title) + '</h4>' +
        '<div class="ep-reward-meta">' +
        (reward.description ? escapeHtml(reward.description) : escapeHtml(reward.type_label)) +
        '</div>' +
        '<div class="ep-reward-actions">' +
        '<span class="ep-points-badge">' + reward.points_cost + ' ' + cfg.strings.points + '</span>' +
        '<button type="button" class="ep-btn ep-btn-secondary" data-reward-id="' + reward.id + '"' +
        (canRedeem ? '' : ' disabled') + '>' + cfg.strings.redeem + '</button>' +
        '</div></div>';

      const btn = card.querySelector('button');
      btn.addEventListener('click', function () {
        redeemReward(reward.id);
      });
      rewardsEl.appendChild(card);
    });
  }

  function renderHistory(entries) {
    historyEl.innerHTML = '';
    if (!entries.length) {
      historyEl.innerHTML = '<li>Sin movimientos todavía.</li>';
      return;
    }

    entries.forEach(function (entry) {
      const li = document.createElement('li');
      const pointsClass = entry.points >= 0 ? 'ep-points-positive' : 'ep-points-negative';
      const sign = entry.points > 0 ? '+' : '';
      li.innerHTML =
        '<span>' + escapeHtml(entry.note || entry.type) + '</span>' +
        '<span class="' + pointsClass + '">' + sign + entry.points + '</span>';
      historyEl.appendChild(li);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function loadDashboard(dni) {
    hideAlert();
    lookupBtn.disabled = true;
    lookupBtn.textContent = cfg.strings.loading;

    try {
      const [balanceData, rewardsData, historyData] = await Promise.all([
        apiGet('balance?dni=' + encodeURIComponent(dni)),
        rewardsCache.length ? Promise.resolve({ rewards: rewardsCache }) : apiGet('rewards'),
        apiGet('history?dni=' + encodeURIComponent(dni)),
      ]);

      currentDni = balanceData.dni;
      rewardsCache = rewardsData.rewards || [];
      balanceEl.textContent = balanceData.balance;
      balanceDniEl.textContent = 'DNI ' + balanceData.dni;
      renderRewards(balanceData.balance);
      renderHistory(historyData.history || []);
      dashboard.classList.remove('ep-hidden');
    } catch (err) {
      showAlert(err.message || cfg.strings.invalidDni);
      dashboard.classList.add('ep-hidden');
    } finally {
      lookupBtn.disabled = false;
      lookupBtn.textContent = cfg.strings.lookup;
    }
  }

  async function redeemReward(rewardId) {
    if (!currentDni) return;
    if (!window.confirm(cfg.strings.redeemConfirm)) return;

    try {
      const result = await apiPost('redeem', {
        dni: currentDni,
        reward_id: rewardId,
      });
      showAlert(result.message || cfg.strings.redeemSuccess, 'success');
      await loadDashboard(currentDni);
    } catch (err) {
      showAlert(err.message || cfg.strings.redeemError);
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const dni = normalizeDni(dniInput.value);
    if (!dni) {
      showAlert(cfg.strings.invalidDni);
      return;
    }
    loadDashboard(dni);
  });

  if (dniInput.value) {
    const prefill = normalizeDni(dniInput.value);
    if (prefill) {
      loadDashboard(prefill);
    }
  }
})();
