using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class PublicacionPatente
{
    public int PublicacionPatenteId { get; set; }

    public int TipoPublicacionId { get; set; }

    public int NumeroGaceta { get; set; }

    public string Pagina { get; set; } = null!;

    public int PatenteId { get; set; }

    public virtual Gacetum NumeroGacetaNavigation { get; set; } = null!;

    public virtual Patente Patente { get; set; } = null!;

    public virtual TipoPublicacion TipoPublicacion { get; set; } = null!;
}
