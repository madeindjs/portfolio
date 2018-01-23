

Prenons un Objet javascript

~~~html
<button id="my-button">Hello</button>
~~~

On le récupère avec JQuery

~~~javascript
let element = $('#my-button');
~~~

Pour le test on lui ajoute un évenement

~~~javascript
element.on('click', () => console.log('hello') );
~~~

Avec Jquery on peut retrouver les évenements avec

~~~javascript
let event = $._data(element[0], 'events').click[0];
~~~

Et pour l'imprimmer il suffit d'utiliser la propriété `handler` et de lui concateiner un `String`:

~~~javascript
console.log(event.handler + '');
// => function(){console.log('hello')}
~~~
