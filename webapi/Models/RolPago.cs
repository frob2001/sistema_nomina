using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class RolPago
{
    public int RolPagoId { get; set; }

    public int? CompaniaId { get; set; }

    public int? AnoGeneracion { get; set; }

    public int? MesGeneracion { get; set; }

    public int? UsuarioId { get; set; }

    public DateTime? FechaCreacion { get; set; }

    public virtual Companium? Compania { get; set; }

    public virtual Usuario? Usuario { get; set; }
}
