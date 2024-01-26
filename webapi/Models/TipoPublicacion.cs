using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class TipoPublicacion
{
    public int TipoPublicacionId { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<PublicacionAccion> PublicacionAccions { get; set; } = new List<PublicacionAccion>();

    public virtual ICollection<PublicacionMarca> PublicacionMarcas { get; set; } = new List<PublicacionMarca>();

    public virtual ICollection<PublicacionPatente> PublicacionPatentes { get; set; } = new List<PublicacionPatente>();
}
