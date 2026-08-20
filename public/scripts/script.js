document.querySelectorAll('.verwijder-fav-form').forEach(form => {
    form.addEventListener('submit', function (event) { //Als iemand form klikt//
        event.preventDefault(); //stopt ff met reloaden bron: https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault// 

        const li = form.closest('li'); //pak de lijst waar deze knop in zit bron: https://developer.mozilla.org/en-US/docs/Web/API/Element/closest//

        li.classList.add('fade-out');  //voeg class toe aan deze list

        setTimeout(() => {
            form.submit(); //submit je form na de 300ms bron: https://www.youtube.com/watch?v=JRevaOwNKTI// 
        }, 300); //animatie duur 300ms//
    });
});

/* bron:https://github.com/fdnd-task/user-experience-enhanced-website/blob/main/docs/client-side-scripting-for-ux.md
*/const forms = document.querySelectorAll(".notitie-form") /*selecteer de notitie form*/

forms.forEach(form => {/*voor elke form op de pagina, voeg een event listener toe voor het submitten van de form bron: https://www.google.com/search?q=meerdere+formulieren+selecteren+javascript&oq=meerdere+formulieren+selecteren+javas&gs_lcrp=EgZjaHJvbWUqBwgBECEYoAEyBggAEEUYOTIHCAEQIRigATIHCAIQIRifBTIHCAMQIRifBTIHCAQQIRifBTIHCAUQIRifBTIHCAYQIRifBTIHCAcQIRifBdIBCTEyNjM1ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8 (optie 2)*/

    form.addEventListener("submit", async function (event) {

        event.preventDefault() /*voorkom dat de pagina ververst wordt bij het submitten van de form*/

        const button = event.submitter //welk submit knop verstuurd het form//

        // DIS IST SAAAAAAAA OPSLANAAA KNOP
        if (button.classList.contains("opslaan_knop")) {

            button.classList.add("laden") /*voeg een class toe aan de knop zodat we deze kunnen stylen tijdens het submitte*/
            button.disabled = true /*zet de button uit zodat er niet meerdere keren op geklikt kan worden tijdens het submitten bron: https://coreui.io/blog/how-to-disable-a-button-in-javascript/*/
            button.textContent = "opslaan..." /*verander de tekst van de button zodat de gebruiker weet dat er iets gebeurt*/

            const formData = new FormData(form)

            const response = await fetch(form.action, {
                method: form.method,
                body: new URLSearchParams(formData)
            })

            if (response.ok) {
                button.classList.remove("laden")/*verwijder de loading class*/
                button.classList.add("opgeslagen")/*voeg class saved toe*/
                button.disabled = false /*zet de button weer aan*/
                button.textContent = "opgeslagen✔"
                //bron:https://wp-mix.com/set-timeout-redirect-javascript/ //
                setTimeout(function () { window.location = "/favorieten?status=opgeslagen"; }, 400)

            } else {
                button.classList.remove("laden")/*verwijder de loading class*/
                button.classList.add("error")/*voeg class error toe*/
                button.disabled = false
                button.textContent = "Error ✘"
                // bron:https://www.youtube.com/watch?v=ZJUhKP9PbHs
                location.reload(true)


            }
        }

        // DIS IST SI VERWIJDER KNOP//
        if (button.classList.contains("vw_knop")) { // kijkt of de vw knop is aangeklikt door de class // //bron: https://htmlacademy.org/courses/javascript-basics/conditions-creating-elements/classlist-contains-method//

            button.classList.add("laden")
            button.disabled = true
            button.textContent = "verwijderen..."



            const formData = new FormData(form)

            const response = await fetch(button.formAction, {
                method: form.method,
                body: new URLSearchParams(formData)
            })

            if (response.ok) {
                button.classList.remove("laden")
                button.classList.add("opgeslagen")
                button.disabled = false
                button.textContent = "verwijderd✔"
                setTimeout(function () {
                    window.location = "/favorieten?status=opgeslagen";
                }, 400)

            } else {
                button.classList.remove("laden")
                button.classList.add("error")
                button.disabled = false
                button.textContent = "Error ✘"
                // bron:https://www.youtube.com/watch?v=ZJUhKP9PbHs
                location.reload(true)

            }
        }
    })
})