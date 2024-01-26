namespace webapi.Controllers
{
    public class EmpleadoDTOGeneral
    {
        public int EmpleadoId { get; set; }
        public CompaniaDTO? Compania { get; set; }
        public TipoEmpleadoDTO? TipoEmpleado { get; set; }
        public string? ApellidoPaterno { get; set; }
        public string? ApellidoMaterno { get; set; }
        public string? Nombres { get; set; }
    }
}
