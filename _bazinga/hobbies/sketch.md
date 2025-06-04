---
show: true
width: 4
date: 2099-01-12 00:01:00 +0800
---

<div class="p-4">
  <h2 style="font-family: 'Great Vibes', cursive; font-weight: 700; letter-spacing: 0.08em; color:rgb(0, 0, 0);">Sketch</h2>
  <hr />
  <p>
    Surprise! I have a hidden talent for sketching. I have been learning to draw since primary school. 
  </p>
  <p class="text-center">
    <a href="{{ 'assets/images/bazinga/hobbies/Agrippa.png' | relative_url }}" target="_blank" class="text-decoration-none">
      Check out my best drawing
      <!-- <hr class="my-2" style="width: 50%; margin: 0 auto;"> -->
    </a>
  </p>

  <script>
    function toggleSketchImage() {
      const container = document.querySelector('#sketchContainer');
      const link = document.querySelector('a[onclick]');
      if (container.style.display === 'none') {
        container.style.display = 'block';
        link.textContent = 'Hide my drawing';
      } else {
        container.style.display = 'none';
        link.textContent = 'Check out my best drawing';
      }
    }

    // Initialize image as hidden when page loads
    document.addEventListener('DOMContentLoaded', function() {
      const container = document.querySelector('#sketchContainer');
      container.style.display = 'none';
    });
  </script>

  <div id="sketchContainer" style="display: none;">
    <img 
      data-src="{{ 'assets/images/bazinga/hobbies/Agrippa.png' | relative_url }}" 
      class="lazy w-100 rounded" 
      src="{{ '/assets/images/empty_300x200.png' | relative_url }}" 
      data-toggle="tooltip" 
      data-placement="top" 
      title="Agrippa, 2018 July">
  </div>

  <!-- <div class="row">
    <div class="col-md-6 mb-3">
      <img 
        data-src="{{ 'assets/images/bazinga/hobbies/Agrippa.png' | relative_url }}" 
        class="lazy w-100 rounded" 
        src="{{ '/assets/images/empty_300x200.png' | relative_url }}" 
        data-toggle="tooltip" 
        data-placement="top" 
        title="Agrippa, 2018 July">
    </div>

    <div class="col-md-6 mb-3">
      <img 
        data-src="{{ 'assets/images/bazinga/hobbies/Medici.png' | relative_url }}" 
        class="lazy w-100 rounded" 
        src="{{ '/assets/images/empty_300x200.png' | relative_url }}" 
        data-toggle="tooltip" 
        data-placement="top" 
        title="Medici, 2018 June">
    </div>
  </div> -->
</div>


