<?php

//header('Content-type:application/json;charset=utf-8');

$servername = "35.189.31.121";
$username = "root";
$password = "eduwell";
$dbname = "Edu_Well";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Could not connect: " . $conn->connect_error);
}

$sql = "SELECT * from School_list";
$result = $conn->query($sql);




if ($result->num_rows > 0) {
    echo '[';
    while($row = $result->fetch_assoc()) {
        echo json_encode($row) . ",";
    }
    echo '{}]';
} else {
    echo "0 result";
}
$conn->close();
?>