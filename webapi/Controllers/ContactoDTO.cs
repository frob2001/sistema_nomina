namespace webapi.Controllers
{
    public class ContactoDTO
    {
        public int ContactoId { get; set; }
        public int ClienteId { get; set; }
        public int? TipoContactoClienteId { get; set; }
        public string Nombre { get; set; } = null!;
        public string? Apellido { get; set; }
        public string? Email { get; set; }
        public string? Telefono { get; set; }
        public string? Cargo { get; set; }
        public string CodigoIdioma { get; set; } = null!;
    }
}
