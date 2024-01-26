using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class MarcaBase
{
    public int MarcaId { get; set; }

    public int AccionTerceroId { get; set; }

    public int? Clase { get; set; }

    public string? CodigoPais { get; set; }

    public int? Propietario { get; set; }

    public int MarcaBaseId { get; set; }

    public virtual AccionTercero AccionTercero { get; set; } = null!;

    public virtual Pai? CodigoPaisNavigation { get; set; }

    public virtual Marca Marca { get; set; } = null!;

    public virtual Propietario? PropietarioNavigation { get; set; }
}
