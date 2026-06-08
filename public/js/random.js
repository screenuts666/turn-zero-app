export let lastMathLog = {};

export function getSecureRandomIndex(max) {
  const randomBuffer = new Uint32Array(1);
  window.crypto.getRandomValues(randomBuffer);

  const raw = randomBuffer[0];
  const maxUint32 = 0xffffffff + 1;
  const randomFloat = raw / maxUint32;
  const index = Math.floor(randomFloat * max);

  // Save math logs for the terminal flex
  lastMathLog.raw = raw;
  lastMathLog.maxUint32 = maxUint32;
  lastMathLog.float = randomFloat;
  lastMathLog.max = max;
  lastMathLog.index = index;

  return index;
}

export function populateMathContent() {
  const mathContent = document.getElementById("math-content");
  if (!mathContent) return;

  if (lastMathLog.mode === "classic" || !lastMathLog.mode) {
    let segmentsHtml = "";
    const selectedIndex = lastMathLog.index;
    const maxPlayers = lastMathLog.max || 1;
    const segmentWidth = (100 / maxPlayers).toFixed(1);
    
    for (let i = 0; i < maxPlayers; i++) {
      const isSelected = i === selectedIndex;
      segmentsHtml += `
        <div class="entropy-segment ${isSelected ? 'selected' : ''}" style="width: ${segmentWidth}%;">
          P${i + 1}
        </div>
      `;
    }

    mathContent.innerHTML = `
      > FETCHING HARDWARE NOISE...<br>
      > Uint32 generated: <span class="highlight">${lastMathLog.raw}</span><br>
      > Normalizing to Float (0.0 to 1.0):<br>
      > ${lastMathLog.raw} / ${lastMathLog.maxUint32}<br>
      > = <span class="highlight">${lastMathLog.float.toFixed(8)}</span><br>
      <br>
      > SECURE SELECTION MAP:<br>
      <div class="entropy-graphic">
        <div class="entropy-bar-container">
          <div class="entropy-pointer" style="left: ${lastMathLog.float * 100}%;">▼</div>
          <div class="entropy-bar">
            ${segmentsHtml}
          </div>
        </div>
        <div class="entropy-legend">
          <span>0.0</span>
          <span>Float: ${lastMathLog.float.toFixed(4)}</span>
          <span>1.0</span>
        </div>
      </div>
      > Float landed in segment P${selectedIndex + 1}<br>
      > WINNER INDEX = <span class="highlight">${lastMathLog.index}</span><br>
      <br>
      > STATUS: <span style="color:#34C759">CRYPTOGRAPHICALLY FAIR</span>
    `;
  } else if (lastMathLog.mode === "teams") {
    const teamColors = ["#00E5FF", "#FF007F", "#FFEA00", "#BD00FF"];
    let boxesHtml = "";
    
    Object.keys(lastMathLog.teamsGroups || {}).forEach((label, idx) => {
      const color = teamColors[idx] || "#ffffff";
      const players = lastMathLog.teamsGroups[label];
      boxesHtml += `
        <div class="team-box-visual" style="--team-color: ${color};">
          <div class="team-box-visual-title">TEAM ${label}</div>
          <div class="team-box-visual-members">${players.join("<br>")}</div>
        </div>
      `;
    });

    mathContent.innerHTML = `
      > SECURE FISHER-YATES SHUFFLE...<br>
      > Players randomized securely with<br>
      > cryptographically fair entropy.<br>
      <br>
      > TEAM DISTRIBUTION MAP:<br>
      <div class="teams-visual-distribution">
        ${boxesHtml}
      </div>
      <br>
      > STATUS: <span style="color:#34C759">TEAMS BALANCED</span>
    `;
  } else if (lastMathLog.mode === "order") {
    let stepsHtml = "";
    (lastMathLog.shuffledOrder || []).forEach((player, idx) => {
      let suffix = "th";
      if (idx === 0) suffix = "st";
      else if (idx === 1) suffix = "nd";
      else if (idx === 2) suffix = "rd";
      
      stepsHtml += `
        <div class="order-step-visual">
          <span class="order-step-badge">${idx + 1}${suffix}</span>
          <span class="order-step-player">${player}</span>
        </div>
      `;
    });

    mathContent.innerHTML = `
      > SECURE FISHER-YATES SHUFFLE...<br>
      > Turn sequence randomized with<br>
      > hardware-generated entropy.<br>
      <br>
      > PLAYING SEQUENCE TIMELINE:<br>
      <div class="order-visual-sequence">
        ${stepsHtml}
      </div>
      <br>
      > STATUS: <span style="color:#34C759">ORDER DECIDED</span>
    `;
  }
}
