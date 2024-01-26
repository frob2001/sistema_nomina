using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class PublicacionMarca
{
    public int PublicacionMarcaId { get; set; }

    public int TipoPublicacionId { get; set; }

    public int NumeroGaceta { get; set; }

    public string Pagina { get; set; } = null!;

    public int MarcaId { get; set; }

    public virtual Marca Marca { get; set; } = null!;

    public virtual Gacetum NumeroGacetaNavigation { get; set; } = null!;

    public virtual TipoPublicacion TipoPublicacion { get; set; } = null!;
}
