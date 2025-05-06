---
show: true
width: 6
date: 2097-01-12 00:01:00 +0800
---

<style>
  .sketch-reference {
    width: 100%;
    height: auto;
    border-radius: 0.5rem;
  }

  .sketch-cropped {
    width: 100%;
    height: 100%;
    max-height: 100%;
    object-fit: cover;
    object-position: top; /* 只裁底部 */
    border-radius: 0.5rem;
  }

  .equal-height-container {
    display: flex;
    gap: 8px;
  }

  .equal-height-container > div {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .equal-height-container img {
    display: block;
  }
</style>

<div class="p-4">
  <h3>Sketch</h3>
  <hr />
  <p>
    Surprise! I have a hidden talent for sketching. I have been learning to draw since primary school. Check out some of my sketches below:
  </p>

  <div class="equal-height-container">
    <div>
      <img 
        id="ref-img"
        src="{{ 'assets/images/bazinga/hobbies/Agrippa.png' | relative_url }}" 
        class="lazy sketch-reference" 
        title="Agrippa, 2018 July">
    </div>

    <div>
      <img 
        src="{{ 'assets/images/bazinga/hobbies/Medici.png' | relative_url }}" 
        class="lazy sketch-cropped" 
        style="height: auto;" 
        title="Medici, 2018 June"
        onload="this.style.height = document.getElementById('ref-img').clientHeight + 'px';">
    </div>
  </div>
</div>

