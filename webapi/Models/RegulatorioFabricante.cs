using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class RegulatorioFabricante
{
    public int RegulatorioFabricanteId { get; set; }

    public int? RegulatorioId { get; set; }

    public string Nombre { get; set; } = null!;

    public string CodigoPais { get; set; } = null!;

    public string Ciudad { get; set; } = null!;

    public virtual Pai CodigoPaisNavigation { get; set; } = null!;

    public virtual Regulatorio? Regulatorio { get; set; }
}
