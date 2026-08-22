const t=document.querySelector('.nav-toggle'),n=document.querySelector('nav');t.addEventListener('click',()=>{const o=n.classList.toggle('open');t.setAttribute('aria-expanded',o)});document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>n.classList.remove('open')));const f=document.querySelector('form'),m=document.querySelector('.form-message');f.addEventListener('submit',e=>{e.preventDefault();if(!f.checkValidity()){m.textContent='Please complete the required fields with valid details.';f.reportValidity();return}m.textContent='Thank you. Your request has been received—an A2P advisor will contact you shortly.';f.querySelector('button').disabled=true;f.querySelector('button').innerHTML='Request received ✓'});

// Active link highlighting on scroll
const navLinks = document.querySelectorAll('nav a:not(.nav-cta)');
const sections = document.querySelectorAll('section[id]');

function updateActiveLink() {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (scrollY >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.style.color = 'inherit';
    if (link.getAttribute('href') === '#' + current) {
      link.style.color = '#0756b6';
      link.style.fontWeight = '700';
    }
  });
}

window.addEventListener('scroll', updateActiveLink);
