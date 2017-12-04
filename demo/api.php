<?php

    if (empty($_POST['items']) || empty($_POST['q'])) {
        echo json_encode(array());
        exit;
    }

    $items = json_decode($_POST['items'], true);
    $q = $_POST['q'];

    $result = array();
    foreach ($items as $item) {
        if (strpos($item['domain'], $q) === 0) {
            $result[] = $item;
        }
    }

    echo json_encode($result);