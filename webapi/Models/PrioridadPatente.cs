using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class PrioridadPatente
{
    public int PrioridadPatenteId { get; set; }

    public string CodigoPais { get; set; } = null!;

    public string Numero { get; set; } = null!;

    public DateTime Fecha { get; set; }

    public int PatenteId { get; set; }

    public virtual Pai CodigoPaisNavigation { get; set; } = null!;

    public virtual Patente Patente { get; set; } = null!;
}
