<?php
session_start();
date_default_timezone_set("America/Lima");
include ('db_connect.php');
if(isset($_POST["enviar"])) {
    $user = $_POST['usuario'];
    $clave = $_POST['contrasena'];
    $ejecutar_campo = mysqli_query($db, "SELECT * FROM accounts WHERE Name='".$user."' AND Password='".$clave."' ");
    if ($tpd = mysqli_fetch_array($ejecutar_campo)) {
        $_SESSION["autentificado"] = "SI";
        $_SESSION['ID'] = $tpd["Id"];
        $_SESSION["usuario"] = $user;
        header("location: home.php");
    } else {
        header("Location: /Profile?errorusuario=si");
    }
} else {
    echo"<h1 style='text-align:center;color:blue;text-shadow: 2px 2px 17px #000000;'>Hola Amigo A Tenido Un Problema Puede Regresar A La Pagina <a href='http://".$_SERVER['SERVER_NAME']."' style='color:#ff0000'>Principal</a> Nuevamente, Por Seguridad De La Web <i style='color:#23FF00'>Junior Cruz</i> A Decidido Que Cual Quier Usuario Que Tenga Este Tipo De Error Su IP Sea Guardada En Nuestros Datos Privados Para Revisión <i style='color:#FF9300'>".$_SERVER['REMOTE_ADDR']."</i></h1>";
}
?>