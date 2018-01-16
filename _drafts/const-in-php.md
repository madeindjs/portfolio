
~~~php
interface Allower {
    function isAllowed(string $field);
}
~~~

~~~php
class Test1 implements Allower {
    const ALLOWED_FIELD  = ['name', 'description'];

    function isAllowed(string $field) {
        return in_array($field, self::ALLOWED_FIELD);
    }
}
~~~

~~~php
class Test2 implements Allower {
    function getAllowedFileds() {
        return ['name', 'description'];
    }
    function isAllowed(string $field) {
        return in_array($field, $this->getAllowedFileds());
    }
}
~~~

~~~php
/**
 * Run `isAllowed` 1000000 times & check time
 */
function test(Allower $test) : float {
    $before = microtime(true);

    for ($i=0; $i < 1000000; $i++) {
        $test->isAllowed('toto');
    }

    return microtime(true) - $before;
}
~~~

~~~php
$result1 = test(new Test1);
$result2 = test(new Test2);

echo <<<TXT
Run times:

- with constant: $result1
- with function: $result2

TXT;
// Run times:

// - with constant: 0.76682591438293
// - with function: 1.2024631500244


~~~
