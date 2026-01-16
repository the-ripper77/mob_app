function getInputValues() {
    let a = Number(document.getElementById("num1").value);
    let b = Number(document.getElementById("num2").value);
    return [a, b];
}

function addition() {
    let [a, b] = getInputValues();
    let c = a + b;

    if (c > 50) {
        document.getElementById("display_message").innerHTML = "The result is greater than 50.";
    } else {
        document.getElementById("display_message").innerHTML = "The result is 50 or less.";
    }

    document.getElementById("display_addition").innerHTML = "The sum of " + a + " and " + b + " is: " + c;
}

function subtraction() {
    let [a, b] = getInputValues();
    let c = a - b;
    document.getElementById("display_subtraction").innerHTML = "The difference of " + a + " and " + b + " is: " + c;
}

function multiplication() {
    let [a, b] = getInputValues();
    let c = a * b;
    document.getElementById("display_multiplication").innerHTML = "The product of " + a + " and " + b + " is: " + c;
}

function division() {
    let [a, b] = getInputValues();
    if (b !== 0) {
        let c = a / b;
        document.getElementById("display_division").innerHTML = "The quotient of " + a + " and " + b + " is: " + c;
    } else {
        document.getElementById("display_division").innerHTML = "Error: Division by zero is not allowed.";
    }
}