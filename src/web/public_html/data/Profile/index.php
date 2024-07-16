<?php
session_start();
include("db_connect.php");
if (isset($_SESSION['Id'])) {
    session_destroy();
}
?>
<!--
Author: Eber
Author URL: https://www.facebook.com/Eber.Junior.GM/
-->
<!DOCTYPE HTML>
<html lang="en">
    <head>
        <title>Entra A Tu Cuenta | <?=$name?></title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="keywords" content="Acceso Solo Para Usuarios De <?=$name?>"/>
        <link rel="stylesheet" href="css/estilo.css" type="text/css" media="all"/>
        <link rel="stylesheet" href="css/font-awesome.css">
        <link href="//fonts.googleapis.com/css?family=Roboto:100,100i,300,300i,400,400i,500,500i,700,700i,900,900i" rel="stylesheet">
    </head>
    <body>
        <div class="header-w3l">
            <h1>
                <span>U</span>ser
                <span>L</span>ogin
                <span>F</span>orm
            </h1>
        </div>
        <div class="main-content-agile">
            <div class="sub-main-w3">
                <h2>Ingresa Tus Datos Correctamente</h2>
                <form action="verificar.php" method="POST">
                    <div class="pom-agile">
                        <span class="fa fa-user-o" aria-hidden="true"></span>
                        <input placeholder="Usuario" name="usuario" class="user" type="text" required="">
                    </div>
                    <div class="pom-agile">
                        <span class="fa fa-key" aria-hidden="true"></span>
                        <input placeholder="Password" name="contrasena" class="pass" type="password" required="">
                    </div>
                    <div class="sub-w3l">
                        <div class="sub-agile">
                            <input type="checkbox" id="brand1" value="">
                            <label for="brand1">
                                <span></span>
                                Recuérdame
                            </label>
                        </div>
                        <a href="#CONTACTE-CON-ALGUN-GM">¿Se te olvidó tu contraseña?</a>
                        <div class="clear"></div>
                    </div>
                    <div class="right-w3l">
                        <input type="submit" value="Login" name="enviar">
                    </div>
                </form>
            </div>
        </div>
        <div class="footer">
            <p>
                &copy;<?=date("Y")?> User Login Form. All rights reserved | Design by
			<a href="https://www.facebook.com/Eber.Junior.GM/">Junior Cruz</a>
            </p>
        </div>
    </body>
</html>