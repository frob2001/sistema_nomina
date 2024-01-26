using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class PublicacionAccion
{
    public int PublicacionAccionId { get; set; }

    public int TipoPublicacionId { get; set; }

    public int NumeroGaceta { get; set; }

    public string Pagina { get; set; } = null!;

    public int AccionTerceroId { get; set; }

    public virtual AccionTercero AccionTercero { get; set; } = null!;

    public virtual Gacetum NumeroGacetaNavigation { get; set; } = null!;

    public virtual TipoPublicacion TipoPublicacion { get; set; } = null!;
}
