using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class PagosPatente
{
    public int PagosPatenteId { get; set; }

    public int PatenteId { get; set; }

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = null!;

    public string? UsuarioId { get; set; }

    public virtual Patente Patente { get; set; } = null!;
}
