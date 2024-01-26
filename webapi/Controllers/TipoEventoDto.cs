namespace webapi.Controllers
{
    public class TipoEventoDto
    {
        public int TipoEventoId { get; set; }
        public string Nombre { get; set; } = null!;
        public string TablaEvento { get; set; } = null!;
    }
}
