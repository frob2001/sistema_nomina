namespace webapi.Controllers
{
    public class UsuarioInfoDTO
    {
        public string? Nombre { get; set; }
        public string? CorreoElectronico { get; set; }
        public EmisorDTO? Emisor { get; set; }
        public SucursalDTO? Sucursal { get; set; }
    }
}
