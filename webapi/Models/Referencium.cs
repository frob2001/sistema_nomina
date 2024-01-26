using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Referencium
{
    public int ReferenciaId { get; set; }

    public int TipoReferenciaId { get; set; }

    public string Referencia { get; set; } = null!;

    public virtual TipoReferencium TipoReferencia { get; set; } = null!;

    public virtual ICollection<AccionTercero> Accions { get; set; } = new List<AccionTercero>();

    public virtual ICollection<Infraccion> Infraccions { get; set; } = new List<Infraccion>();

    public virtual ICollection<Marca> Marcas { get; set; } = new List<Marca>();

    public virtual ICollection<Patente> Patentes { get; set; } = new List<Patente>();

    public virtual ICollection<Regulatorio> Regulatorios { get; set; } = new List<Regulatorio>();
}
