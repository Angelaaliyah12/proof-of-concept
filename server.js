// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
// Deze package is geïnstalleerd via `npm install`, en staat als 'dependency' in package.json
import express from "express";

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from "liquidjs";

// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express();

// Maak werken met data uit formulieren iets prettiger
app.use(express.urlencoded({ extended: true }));

// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
// Bestanden in deze map kunnen dus door de browser gebruikt worden
app.use(express.static("public"));

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine("liquid", engine.express());

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set("views", "./views");

// bron: (voor express data in alle routes) https://expressjs.com/en/5x/api/application/#appusepath-callback--callback
app.use(async (req, res, next) => { //inplaats van dat ik het opnieuw bij elke route schrijf//

	const favResponse = await fetch(
		'https://fdnd-agency.directus.app/items/f_list/31?fields=houses.id'
	);

	const favJson = await favResponse.json();

	const count = favJson.data.houses.length;

	res.locals.favTeller = count; //https://expressjs.com/en/5x/api/response/ bron: https://www.geeksforgeeks.org/node-js/how-to-create-global-variables-accessible-in-all-views-using-express-nodejs/

	next();
});

app.get('/', async function(request, response){
    const params={
        fields:'*'
    }
    const fundaResponse = await fetch('https://fdnd-agency.directus.app/items/f_houses?'
    + new URLSearchParams(params)
    )
    const fundaResponseJson = await fundaResponse.json();
     //Prijs in euro omzetten met euro teken en punten//
    //Krijn laten zien met chama//
fundaResponseJson.data.forEach(huis => {
  huis.price = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(huis.price);
});
    response.render("index.liquid",{
        funda: fundaResponseJson.data
    })
});


app.get('/prijs-laag-hoog', async function (request, response) {

	const params = {
		'sort': 'price',
		'fields': '*'
	}

	const houseResponse = await fetch(
		'https://fdnd-agency.directus.app/items/f_houses/?' +
		new URLSearchParams(params)
	)

	const houseResponseJSON = await houseResponse.json()

	response.render('index.liquid', {
		funda: houseResponseJSON.data
	})
})

app.get('/prijs-hoog-laag', async function (request, response) {

	const params = {
		'sort': '-price',
		'fields': '*'
	}

	const houseResponse = await fetch(
		'https://fdnd-agency.directus.app/items/f_houses/?' +
		new URLSearchParams(params)
	)

	const houseResponseJSON = await houseResponse.json()

	response.render('index.liquid', {
		funda: houseResponseJSON.data
	})
})


app.get('/detail/:id', async function(request, response){
    const id= request.params.id
    const status = request.query.status 
		//hier haal ik de huizen op//
    const detailResponse= await fetch ('https://fdnd-agency.directus.app/items/f_houses/'
         + id)
         const detailResponseJson = await detailResponse.json()
// hier haal ik de favorieten lijstje op//
	const favResponse = await fetch(
		'https://fdnd-agency.directus.app/items/f_list/31?fields=*.*'
	);
	const favJSON = await favResponse.json();

	// kijken of huis in favorieten lijsjte zit//
	const isFavoriet = favJSON.data.houses.some(
		house => house.f_houses_id == id
	);
	//prijs formattinggaaaa//
        detailResponseJson.data.price = new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR",
    }).format(detailResponseJson.data.price);

         response.render("detail.liquid",{
            detail: detailResponseJson.data,
            status: status,
			isFavoriet: isFavoriet

         })
});


app.get('/favorieten', async function (request, response) {
	const status = request.query.status

  const favResponse = await fetch(
		'https://fdnd-agency.directus.app/items/f_list/31?fields=houses.id,houses.f_houses_id.*,houses.f_houses_id.notes.note'

  );
  const favResponseJson = await favResponse.json()

 favResponseJson.data.price = new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR",
    }).format(favResponseJson.data.price);

  response.render('favorieten.liquid', {
    favorieten: favResponseJson.data.houses,
	status: status
  });

});



app.post('/favorieten', async function (request, response) {

  const houseId = request.body.houseId;

  // dit is mijn lijstid17 dezelijsthaal ik dusop
  const favResponse = await fetch(
    'https://fdnd-agency.directus.app/items/f_list/31?fields=*.*'
  );

  const favJSON = await favResponse.json();

  // kijken of huis al is opgeslagen
  const favHuis = favJSON.data.houses.find(
    house => house.f_houses_id == houseId
  );

  if (favHuis) {

    await fetch( //de delete patchaaaa
      'https://fdnd-agency.directus.app/items/f_list/31',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          houses: {
            delete: [favHuis.id]
          }
        })
      }
    );
      response.redirect('/detail/' + houseId + '?status=verwijderd');

  } else {

    await fetch( 
      'https://fdnd-agency.directus.app/items/f_list/31',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          houses: {
            create: [
              {
                f_houses_id: houseId
              }]
            }
        })
    });
  }
  response.redirect('/detail/' + houseId + '?status=succes');
});

app.post('/verwijder-favoriet', async function (request, response) {

	const favhuisId = request.body.favhuisId;

	await fetch(
		'https://fdnd-agency.directus.app/items/f_list/31',
		{
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				houses: {
					delete: [favhuisId]
				}
			})
		}
	);

	response.redirect('/favorieten' + '?status=verwijderd');
});


app.post('/notitie', async function (request, response) {

  //haalt id van huis op (de notitie hoort dan bij die id)
    const houseId = request.body.houseId;
    // haalt de notitie zelf op dus wat de gebruiker schrijft
    const notitie = request.body.notitie;

    // console.log('houseId:', houseId);
    // console.log('notitie:', notitie);

    //haalt de notitie van de specifieke huis id
    const noteResponse = await fetch (
      'https://fdnd-agency.directus.app/items/f_notes?filter[house][_eq]=' + houseId
    );
    
    //de response op de url krijg je terug in json
    const noteJson = await noteResponse.json();

    //kijk je of er notitie al is
    if (noteJson.data.length > 0){

      //als al notitie bestaat dan pak de note id van het huis en maak dat noteId
      const noteId = noteJson.data[0].id;

      //ga naar de notitie met die specifieke notitie id
      await fetch(
        'https://fdnd-agency.directus.app/items/f_notes/' + noteId,
        {
          //patch> pas de bestaande notitie aan
          method: 'PATCH',
          //zegt tegen directus dat de gegevens die ik stuur is json
          headers: {
            'Content-type' : 'application/json'
          },
          //stuur de nieuwe tekst als json naar directus
          body: JSON.stringify({
            note: notitie
          })
        }
      );

      //als er nog geen notitie is
    } else{

      //ga naar de notitie 
    await fetch(
        'https://fdnd-agency.directus.app/items/f_notes',
        {
          //post> maak iets niews aan
            method: 'POST',
            //hoe je data verstuurd naar directus dus hier in json formaat
            headers: {
                'Content-Type': 'application/json'
            },
            // stuur van de body de house id en de notitie naar directus
            body: JSON.stringify({
                house: houseId,
                note: notitie
            })
        }
    );
  }
    response.redirect('/favorieten?status=opgeslagen');
    // console.log('notitie')
});

app.post('/verwijder-notitie', async function (request, response){
  const houseId = request.body.houseId;

  const noteResponse = await fetch (
    'https://fdnd-agency.directus.app/items/f_notes?filter[house][_eq]=' + houseId
  );

  const noteJson = await noteResponse.json();
  if (noteJson.data.length > 0){
    const noteId = noteJson.data[0].id

    await fetch(
     'https://fdnd-agency.directus.app/items/f_notes/' + noteId,
      {
        method: 'DELETE'
      }
    )
  }
  response.redirect('/favorieten')
})

// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000; als deze applicatie ergens gehost wordt, waarschijnlijk poort 80
app.set("port", process.env.PORT || 8001);

// Start Express op, gebruik daarbij het zojuist ingestelde poortnummer op
app.listen(app.get("port"), function () {
  console.log(`http://localhost:${app.get("port")}`);
});

