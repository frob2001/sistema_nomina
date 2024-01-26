using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Gacetum
{
    public int Numero { get; set; }

    public DateTime? Fecha { get; set; }

    public string? CodigoPais { get; set; }

    public string? UrlGaceta { get; set; }

    public virtual Pai? CodigoPaisNavigation { get; set; }

    public virtual ICollection<MarcaOpuestum> MarcaOpuesta { get; set; } = new List<MarcaOpuestum>();

    public virtual ICollection<PublicacionAccion> PublicacionAccions { get; set; } = new List<PublicacionAccion>();

    public virtual ICollection<PublicacionMarca> PublicacionMarcas { get; set; } = new List<PublicacionMarca>();

    public virtual ICollection<PublicacionPatente> PublicacionPatentes { get; set; } = new List<PublicacionPatente>();
}
