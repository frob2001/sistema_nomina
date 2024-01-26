namespace webapi.Controllers
{
    public class RegulatorioFabricanteDTO
    {
        public int RegulatorioFabricanteId { get; set; }
        public int? RegulatorioId { get; set; }
        public string Nombre { get; set; } = null!;
        public string CodigoPais { get; set; } = null!;
        public string Ciudad { get; set; } = null!;
    }
}
