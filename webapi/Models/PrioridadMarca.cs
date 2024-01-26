using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class PrioridadMarca
{
    public int PrioridadMarcaId { get; set; }

    public string CodigoPais { get; set; } = null!;

    public string Numero { get; set; } = null!;

    public DateTime Fecha { get; set; }

    public int MarcaId { get; set; }

    public virtual Pai CodigoPaisNavigation { get; set; } = null!;

    public virtual Marca Marca { get; set; } = null!;
}
