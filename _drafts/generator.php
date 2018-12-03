<?php

const ARRAY_SIZE = 100000000;



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



function withGenerator() {
    for ($i=0; $i < ARRAY_SIZE; $i++) { 
        yield $i;
    }
}

function withoutGenerator(){
    $array = [];
    for ($i=0; $i < ARRAY_SIZE; $i++) { 
        $array[] = $i;
    }
    return $array;
}


/**
 * Simply execute given method 
 */
class Benchmark {
    private $startTime;
    private $endTime;
    
    function __construct(callable $method) {
        $this->startTime = microtime(true);
        // execute methode
        call_user_func($method);
        $this->endTime = microtime(true);
    }

    function getTime() {
        return $this->endTime - $this->startTime;
    }
}


$benchmarkWithGenerator = new Benchmark('withGenerator');
printf("With generator:   \t%.6f s" . PHP_EOL, $benchmarkWithGenerator->getTime());


$benchmarkWithoutGenerator = new Benchmark('withoutGenerator');
printf("Without generator:\t%.6f s" . PHP_EOL, $benchmarkWithoutGenerator->getTime());



