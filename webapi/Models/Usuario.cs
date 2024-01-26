using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Usuario
{
    public int UsuarioId { get; set; }

    public string? Nombre { get; set; }

    public string? CorreoElectronico { get; set; }

    public string? Contrasena { get; set; }

    public int? EmisorId { get; set; }

    public int? SucursalId { get; set; }

    public virtual Emisor? Emisor { get; set; }

    public virtual ICollection<RolPago> RolPagos { get; set; } = new List<RolPago>();

    public virtual Sucursal? Sucursal { get; set; }
}
