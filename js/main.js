/* Southwest Design Studio - mobile nav + preview form */
(function(){
  var btn = document.querySelector('.menu-btn');
  var nav = document.querySelector('.mob-nav');
  if (btn && nav) {
    btn.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var form = document.getElementById('preview-form');
  if (form) {
    var note = document.getElementById('form-note');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      if (!name || !email || email.indexOf('@') < 0) {
        note.textContent = 'Please add your name and a valid email so we can reach you.';
        return;
      }
      note.textContent = 'Sending your request...';
      var data = {
        name: name,
        phone: form.phone.value.trim(),
        email: email,
        message: form.message.value.trim(),
        _subject: 'Private preview request - Southwest Design Studio'
      };
      fetch('https://formsubmit.co/ajax/sbankosz@swcorridor.com', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify(data)
      }).then(function(r){ return r.json(); })
      .then(function(){
        note.textContent = 'Thank you, ' + name.split(' ')[0] + '. Your preview request is on its way. We will be in touch shortly.';
        form.reset();
      })
      .catch(function(){
        note.textContent = 'Something did not go through. Please call us at (877) 646-0167 instead.';
      });
    });
  }
})();
