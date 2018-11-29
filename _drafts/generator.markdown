---
title: Les générateurs en PHP
---

Très largement utilisé en Ruby, les générateurs sont moins connus en PHP ils sont pourtant très utiles pour optimiser un script.


Permet de ne pas charger un tableau dans toute la mémoire 

Produit un [`Iterator`][iterator]



> le but des générateurs est de créer facilement des itérateurs

> Un itérateur est une instance d’une classe implémentant [`Iterator`][iterator]


## Explication


~~~php
<?php
// first_iterator.php

function stepsIterator() {
    echo "echo 0" . PHP_EOL;
    yield "yield 1" . PHP_EOL;
    echo "echo 1" . PHP_EOL;
    yield "yield 2" . PHP_EOL;
    echo "echo 2" . PHP_EOL;
}

$iterator = stepsIterator();

echo "Iterator called" . PHP_EOL;

foreach (stepsIterator() as $data) {
    echo $data;
}
~~~


~~~bash
$ php first_iterator.php
Iterator called
echo 0
yield 1
echo 1
yield 2
echo 2
~~~


On voit donc que:

1. la fonction produit un [`Iterator`][iterator] mais la fonction n'est pas éxécutée (aucun `echo` dans interne à la fonction n'apparait)
2. à la première boucle du `foreach` la fonction est éxecutée jusquèà atteindre le premier `yield` qu'il rencontre. Le résultat renvoyé par `yield` est stocké dans la variable `$data` du `foreach`


## Benchmark


~~~php
const ARRAY_SIZE = 10000000;

function withoutGenerator(){
    $array = [];
    for ($i=0; $i < ARRAY_SIZE; $i++) { 
        $array[] = $i;
    }
    return $array;
}
~~~

~~~php
function withGenerator() {
    for ($i=0; $i < ARRAY_SIZE; $i++) { 
        yield $i;
    }
}
~~~


~~~php
class Benchmark {
    private $startTime;
    private $endTime;
    
    function __construct(callable $method) {
        $this->startTime = microtime(true);
        call_user_func($method);
        $this->endTime = microtime(true);
    }

    function getTime() {
        return $this->endTime - $this->startTime;
    }
}
~~~


~~~php
$benchmarkWithGenerator = new Benchmark('withGenerator');
printf("With generator:   \t%.6f s" . PHP_EOL, $benchmarkWithGenerator->getTime());

$benchmarkWithoutGenerator = new Benchmark('withoutGenerator');
printf("Without generator:\t%.6f s" . PHP_EOL, $benchmarkWithoutGenerator->getTime());
~~~

~~~
With generator:     0.000001 s
Without generator:  0.302029 s
~~~

[iterator]: https://secure.php.net/manual/fr/class.iterator.php
[generator]: https://secure.php.net/manual/fr/class.generator.php
[generators_overview]: https://secure.php.net/manual/fr/language.generators.overview.php