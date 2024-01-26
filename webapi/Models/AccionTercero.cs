using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class AccionTercero
{
    public int AccionTerceroId { get; set; }

    public int TipoAccionId { get; set; }

    public int OficinaTramitante { get; set; }

    public int AbogadoId { get; set; }

    public int MarcaOpuesta { get; set; }

    public string ReferenciaInterna { get; set; } = null!;

    public int ClienteId { get; set; }

    public bool? Activo { get; set; }

    public virtual Abogado Abogado { get; set; } = null!;

    public virtual Cliente Cliente { get; set; } = null!;

    public virtual ICollection<MarcaBase> MarcaBases { get; set; } = new List<MarcaBase>();

    public virtual MarcaOpuestum MarcaOpuestaNavigation { get; set; } = null!;

    public virtual Cliente OficinaTramitanteNavigation { get; set; } = null!;

    public virtual ICollection<PublicacionAccion> PublicacionAccions { get; set; } = new List<PublicacionAccion>();

    public virtual TipoAccion TipoAccion { get; set; } = null!;

    public virtual ICollection<Referencium> Referencia { get; set; } = new List<Referencium>();
    public virtual ICollection<EstadoAccion> EstadoAcciones { get; set; } = new List<EstadoAccion>();
}
