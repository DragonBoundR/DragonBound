<?php
session_start();
include ('db_connect.php');
$acc = $_SESSION["ID"];
if(!isset($_SESSION["usuario"]))
    header("Location: /Profile?NO-PUEDE-INGRESAR-A-ESA-PAGINA-SIN-ANTES-INICIAR-SESSION-MEDIANTE-SU-CUENTA-EN-LA-PAGINA-WEB-DragonTanks");
$ro = mysqli_query($db, "SELECT * FROM users WHERE IdAcc='".$acc."'");
$row = mysqli_fetch_array($ro);
?>
<!--
Author: Eber
Author URL: https://www.facebook.com/Eber.Junior.GM/
-->
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Perfil | <?=$row['game_id']?></title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="keywords" content="Todo Acceso Permitido Aquí Son Especialmente Para Los Usuarios De <?=$name?>"/>
        <script type="application/x-javascript">
             addEventListener("load", function() { setTimeout(hideURLbar, 0); }, false);
		function hideURLbar(){ window.scrollTo(0,1); } 
        </script>
        <script src="js/jquery-2.1.3.min.js" type="text/javascript"></script>
        <script type="text/javascript" src="js/sliding.form.js"></script>
        <link href="css/style.css?#" rel="stylesheet" type="text/css" media="all"/>
        <link rel="stylesheet" href="css/font-awesome.min.css"/>
        <link rel="stylesheet" href="css/smoothbox.css" type='text/css' media="all"/>
        <link href="//fonts.googleapis.com/css?family=Pathway+Gothic+One" rel="stylesheet">
        <link href='//fonts.googleapis.com/css?family=Open+Sans:400,300,300italic,400italic,600,600italic,700,700italic,800,800italic' rel='stylesheet' type='text/css'>
    </head>
    <body>
        <div class="main">
            <h1>Profile <?=$name?></h1>
            <div id="navigation" style="display:none;" class="w3_agile">
                <ul>
                    <li class="selected">
                        <a href="#">
                            <i class="fa fa-home" aria-hidden="true"></i>
                            <span>Home</span>
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <i class="fa fa-folder" aria-hidden="true"></i>
                            <span>Foto</span>
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <!--<i class="fa fa-envelope" aria-hidden="true"></i>-->
                            <i class="fa fa-folder" aria-hidden="true"></i>
                            <span>Fondo</span>
                        </a>
                    </li>
                </ul>
            </div>
            <div id="wrapper" class="w3ls_wrapper w3layouts_wrapper">
                <div id="steps" style="margin:0 auto;" class="agileits w3_steps">
                    <form id="formElem" name="formElem" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF'])?>" method="POST" class="w3_form w3l_form_fancy">
                        <fieldset class="step agileinfo w3ls_fancy_step">
                            <legend>Info</legend>
                            <div class="abt-agile">
                                <div class="abt-agile-left"><img src="<?=$row['photo_url']?>"> </div>
                                <div class="abt-agile-right">
                                    <h3><?=$row['game_id']?> - <img src="ranks/<?=$row['rank']?>.gif"></h3>
                                    <h5>Junior Cruz</h5>
                                    <ul class="address">
                                        <li>
                                            <ul class="address-text">
                                                <li>
                                                    <b>GP's </b>
                                                </li>
                                                <li>: <?=$row['gp']?></li>
                                            </ul>
                                        </li>
                                        <li>
                                            <ul class="address-text">
                                                <li>
                                                    <b>Cash </b>
                                                </li>
                                                <li>: <?=$row['cash']?></li>
                                            </ul>
                                        </li>
                                        <li>
                                            <ul class="address-text">
                                                <li>
                                                    <b>Gold </b>
                                                </li>
                                                <li>: <?=$row['gold']?></li>
                                            </ul>
                                        </li>
                                        <li>
                                            <ul class="address-text">
                                                <li>
                                                    <b>Win </b>
                                                </li>
                                                <li>: <?=$row['win']?></li>
                                            </ul>
                                        </li>
                                        <li>
                                            <ul class="address-text">
                                                <li>
                                                    <b>Loss </b>
                                                </li>
                                                <li>: <?=$row['loss']?></li>
                                            </ul>
                                        </li>
                                    </ul>
                                </div>
                                <div class="clear"></div>
                            </div>
                        </fieldset>
                        <fieldset class="step wthree">
                            <legend>Foto</legend>
                            <div class="agilecontactw3ls-grid asdasas">
                                <div class="agile-con-left">
                                    <form action="<?php echo htmlspecialchars($_SERVER['PHP_SELF'])?>" method="POST">
                                        <input type="text" name="foto" placeholder="Coloca La Url De Tu Imagen" required="">
                                        <div class="send-button">
                                            <input type="submit" value="Añadir" name="enviarfoto">
                                        </div>
                                    </form>
                                </div>
                                <div class="clear"></div>
                            </div>
                        </fieldset>
                        <fieldset class="step w3_agileits">
                            <legend><h1 style="color:#00e8ff;">Fondo</h1></legend>
                            <div class="agilecontactw3ls-grid">
                                <div class="agile-con-left">
                                    <form action="<?php echo htmlspecialchars($_SERVER['PHP_SELF'])?>" method="POST">
                                        <input type="text" name="fondo" placeholder="Coloca La Url De Tu Imagen" required="">
                                        <div class="send-button">
                                            <input type="submit" value="Añadir" name="fondoenviar">
                                        </div>
                                    </form>
                                </div>
                                <div class="clear"></div>
                            </div>
                        </fieldset>
                    </form>
                    <!-- COMIENZO A VALIDAR TODO -->
                    <?php
                     if (isset($_POST['enviarfoto'])) {
                         $foto = $_POST['foto'];
                         /* Verificaciones */
                         if (empty($foto)) {
                             echo '<script>alert("Por Favor No Deje Estos Campos vacíos");window.history.go(-1);</script>';
                             exit;
                         } else {
                             if (strlen($foto) > 200) {
                                 echo '<script>alert("Lo Sentimos La Url Es Demasiado Larga!");window.history.go(-1);</script>';
                             exit;
                             }
                         }
                         /* Verificaciones */
                         $nm = mysqli_query($db, "UPDATE users SET photo_url='".$foto."' WHERE IdAcc='".$acc."' ");
                         echo '<script>alert("Tu Foto A Sido Subida Correctamente Usuario: '.$row['game_id'].'");window.history.go(-1);</script>';
                     }
                    ?>
                    <?php
                     if (isset($_POST['fondoenviar'])) {
                         $fondo = $_POST['fondo'];
                         /* Verificaciones */
                         if (empty($fondo)) {
                             echo '<script>alert("Por Favor No Deje Estos Campos vacíos");window.history.go(-1);</script>';
                             exit;
                         } else {
                             if (strlen($fondo) > 200) {
                                 echo '<script>alert("Lo Sentimos La Url Es Demasiado Larga!");window.history.go(-1);</script>';
                             exit;
                             }
                         }
                         /* Verificaciones */
                         $nm = mysqli_query($db, "UPDATE users SET bg_url='".$fondo."' WHERE IdAcc='".$acc."' ");
                         echo '<script>alert("Tu Fondo A Sido Subida Correctamente Usuario: '.$row['game_id'].'");window.history.go(-1);</script>';
                     }
                    ?>
                    <!-- TERMINO LA VALIDACIÓN -->
                </div>
            </div>
            <div class="agileits_copyright">
                <p>
                    &copy;<?=date("Y")?> Accessible Profile. All Rights Reserved | Design by <a href="https://www.facebook.com/Eber.Junior.GM/">Junior Cruz</a>
                </p>
            </div>
        </div>
        <script type="text/javascript" src="js/smoothbox.jquery2.js"></script>
    </body>
</html>