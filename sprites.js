(function () {
  function drawBackground(ctx, width, height, time) {
    ctx.save();

    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#f06d58');
    sky.addColorStop(0.52, '#f6ad68');
    sky.addColorStop(1, '#f7d28a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const sunX = width * 0.73;
    const sunY = height * 0.27;
    const pulse = 1 + Math.sin(time * 0.8) * 0.025;
    ctx.fillStyle = 'rgba(255, 242, 177, 0.22)';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 56 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff0a6';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 31 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#c55d58';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.55);
    ctx.lineTo(width * 0.16, height * 0.43);
    ctx.lineTo(width * 0.3, height * 0.56);
    ctx.lineTo(width * 0.47, height * 0.4);
    ctx.lineTo(width * 0.64, height * 0.56);
    ctx.lineTo(width * 0.82, height * 0.45);
    ctx.lineTo(width, height * 0.55);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#7d5052';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.68);
    ctx.quadraticCurveTo(width * 0.18, height * 0.52, width * 0.36, height * 0.68);
    ctx.quadraticCurveTo(width * 0.55, height * 0.51, width * 0.72, height * 0.68);
    ctx.quadraticCurveTo(width * 0.88, height * 0.55, width, height * 0.69);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 221, 139, 0.75)';
    const stripeOffset = (time * 9) % 68;
    for (let x = -80 - stripeOffset; x < width + 80; x += 68) {
      ctx.fillRect(x, height * 0.74, 34, 3);
    }

    ctx.restore();
  }

  function drawGround(ctx, width, height, groundHeight, offset) {
    ctx.save();
    const top = height - groundHeight;

    ctx.fillStyle = '#2e4f51';
    ctx.fillRect(0, top, width, groundHeight);
    ctx.fillStyle = '#f2c477';
    ctx.fillRect(0, top, width, 8);
    ctx.strokeStyle = '#272d3a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, top + 1.5);
    ctx.lineTo(width, top + 1.5);
    ctx.stroke();

    const tile = 46;
    const scroll = ((offset % tile) + tile) % tile;
    ctx.fillStyle = '#3f6f67';
    for (let x = -scroll - tile; x < width + tile; x += tile) {
      ctx.fillRect(x, top + 18, 22, groundHeight - 18);
    }

    ctx.strokeStyle = '#83b08a';
    ctx.lineWidth = 2;
    for (let x = -scroll - tile; x < width + tile; x += tile) {
      ctx.beginPath();
      ctx.moveTo(x + 7, top + 31);
      ctx.lineTo(x + 16, top + 23);
      ctx.moveTo(x + 16, top + 47);
      ctx.lineTo(x + 25, top + 39);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawBird(ctx, x, y, size, velocity) {
    ctx.save();
    const tilt = Math.max(-0.3, Math.min(0.45, velocity / 900));
    ctx.translate(x, y);
    ctx.rotate(tilt);

    const half = size * 0.5;
    const bodyW = size * 0.76;
    const bodyH = size * 0.5;

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.fillStyle = '#f7f4e8';
    ctx.strokeStyle = '#252d3b';
    ctx.lineWidth = Math.max(2, size * 0.075);
    ctx.beginPath();
    ctx.ellipse(-size * 0.04, size * 0.05, bodyW * 0.5, bodyH * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#d4e5e1';
    ctx.beginPath();
    ctx.moveTo(-size * 0.16, size * 0.03);
    ctx.quadraticCurveTo(-size * 0.04, -size * 0.26, size * 0.22, -size * 0.02);
    ctx.quadraticCurveTo(size * 0.02, size * 0.02, -size * 0.16, size * 0.03);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f3b84b';
    ctx.beginPath();
    ctx.moveTo(size * 0.25, -size * 0.02);
    ctx.lineTo(half, size * 0.04);
    ctx.lineTo(size * 0.24, size * 0.13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#252d3b';
    ctx.beginPath();
    ctx.arc(size * 0.2, -size * 0.13, Math.max(1.5, size * 0.045), 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#f3b84b';
    ctx.lineWidth = Math.max(2, size * 0.06);
    ctx.beginPath();
    ctx.moveTo(-size * 0.18, size * 0.23);
    ctx.lineTo(-size * 0.1, size * 0.31);
    ctx.moveTo(-size * 0.02, size * 0.23);
    ctx.lineTo(size * 0.05, size * 0.31);
    ctx.stroke();

    ctx.restore();
  }

  function drawPipe(ctx, x, gapTop, gapBottom, pipeWidth, height) {
    ctx.save();
    const dark = '#253a3d';
    const trunk = '#3f7b67';
    const leaf = '#78a85f';
    const border = Math.max(2, pipeWidth * 0.06);
    const crownHeight = Math.min(34, pipeWidth * 0.62);

    function palmBlock(top, bottom, crownAtBottom) {
      if (bottom <= top) return;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, top, pipeWidth, bottom - top);
      ctx.clip();

      ctx.fillStyle = trunk;
      ctx.fillRect(x, top, pipeWidth, bottom - top);
      ctx.strokeStyle = dark;
      ctx.lineWidth = border;
      ctx.strokeRect(x + border * 0.5, top + border * 0.5, pipeWidth - border, bottom - top - border);

      ctx.strokeStyle = '#b2c879';
      ctx.lineWidth = Math.max(2, pipeWidth * 0.045);
      for (let stripe = top + 14; stripe < bottom; stripe += 18) {
        ctx.beginPath();
        ctx.moveTo(x + pipeWidth * 0.12, stripe);
        ctx.lineTo(x + pipeWidth * 0.88, stripe - 6);
        ctx.stroke();
      }

      const crownY = crownAtBottom ? bottom - 5 : top + 5;
      ctx.fillStyle = leaf;
      ctx.strokeStyle = dark;
      ctx.lineWidth = border;
      ctx.beginPath();
      ctx.arc(x + pipeWidth * 0.5, crownY, crownHeight * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      for (let i = 0; i < 6; i += 1) {
        const angle = -Math.PI * 0.95 + i * Math.PI * 0.38;
        ctx.beginPath();
        ctx.moveTo(x + pipeWidth * 0.5, crownY);
        ctx.quadraticCurveTo(
          x + pipeWidth * 0.5 + Math.cos(angle) * pipeWidth * 0.33,
          crownY + Math.sin(angle) * crownHeight * 0.28,
          x + pipeWidth * 0.5 + Math.cos(angle) * pipeWidth * 0.52,
          crownY + Math.sin(angle) * crownHeight * 0.56
        );
        ctx.stroke();
      }
      ctx.restore();
    }

    palmBlock(0, gapTop, true);
    palmBlock(gapBottom, height, false);
    ctx.restore();
  }

  window.SPRITES = { drawBackground, drawGround, drawBird, drawPipe };
})();
