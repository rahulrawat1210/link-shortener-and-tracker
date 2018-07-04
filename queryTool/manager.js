var button = document.querySelectorAll('.button');

var liner = document.querySelector('.liner');

button.addEventListener('mouseenter', function() {
    liner.classList.add('linerActive');
    this.classList.add('buttonActive');
  });
  
  button.addEventListener('mouseleave', function() {
    liner.classList.remove('linerActive');
    this.classList.remove('buttonActive');
  });