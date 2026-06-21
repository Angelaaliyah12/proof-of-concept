document.querySelectorAll('.verwijder-fav-form').forEach(form => {
    form.addEventListener('submit', function (event) { //Als iemand form klikt//
        event.preventDefault(); //stopt ff met reloaden bron: https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault// 

        const li = form.closest('li'); //pak de lijst waar deze knop in zit//

        li.classList.add('fade-out');  //voeg class toe aan deze list

        setTimeout(() => {
            form.submit(); //submit je form na de 300ms bron: https://www.youtube.com/watch?v=JRevaOwNKTI// 
        }, 300); //animatie duur 300ms//
    });
});