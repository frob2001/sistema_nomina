using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace webapi.Models;

public partial class KattionDataBaseContext : DbContext
{
    public KattionDataBaseContext()
    {
    }

    public KattionDataBaseContext(DbContextOptions<KattionDataBaseContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Abogado> Abogados { get; set; }

    public virtual DbSet<AccionTercero> AccionTerceros { get; set; }

    public virtual DbSet<Autoridad> Autoridads { get; set; }

    public virtual DbSet<CasoInfraccion> CasoInfraccions { get; set; }

    public virtual DbSet<Clase> Clases { get; set; }

    public virtual DbSet<Cliente> Clientes { get; set; }

    public virtual DbSet<ConexionComentario> ConexionComentarios { get; set; }

    public virtual DbSet<ConexionCorreo> ConexionCorreos { get; set; }

    public virtual DbSet<ConexionDocumento> ConexionDocumentos { get; set; }

    public virtual DbSet<ConexionEvento> ConexionEventos { get; set; }

    public virtual DbSet<ConexionLogo> ConexionLogos { get; set; }

    public virtual DbSet<ContactosCliente> ContactosClientes { get; set; }

    public virtual DbSet<Estado> Estados { get; set; }

    public virtual DbSet<EstadoAccion> EstadoAccions { get; set; }

    public virtual DbSet<EstadoInfraccion> EstadoInfraccions { get; set; }

    public virtual DbSet<EstadoMarca> EstadoMarcas { get; set; }

    public virtual DbSet<EstadoPatente> EstadoPatentes { get; set; }

    public virtual DbSet<Evento1> Evento1s { get; set; }

    public virtual DbSet<Evento2> Evento2s { get; set; }

    public virtual DbSet<Evento3> Evento3s { get; set; }

    public virtual DbSet<Evento4> Evento4s { get; set; }

    public virtual DbSet<Gacetum> Gaceta { get; set; }

    public virtual DbSet<Grupo> Grupos { get; set; }

    public virtual DbSet<GrupoDosEvento4> GrupoDosEvento4s { get; set; }

    public virtual DbSet<GrupoUnoEvento4> GrupoUnoEvento4s { get; set; }

    public virtual DbSet<Idioma> Idiomas { get; set; }

    public virtual DbSet<Infraccion> Infraccions { get; set; }

    public virtual DbSet<InstanciasRecordatorio> InstanciasRecordatorios { get; set; }

    public virtual DbSet<Inventor> Inventors { get; set; }

    public virtual DbSet<Marca> Marcas { get; set; }

    public virtual DbSet<MarcaBase> MarcaBases { get; set; }

    public virtual DbSet<MarcaClase> MarcaClases { get; set; }

    public virtual DbSet<MarcaOpuestum> MarcaOpuesta { get; set; }

    public virtual DbSet<PagosPatente> PagosPatentes { get; set; }

    public virtual DbSet<Pai> Pais { get; set; }

    public virtual DbSet<Patente> Patentes { get; set; }

    public virtual DbSet<PrioridadMarca> PrioridadMarcas { get; set; }

    public virtual DbSet<PrioridadPatente> PrioridadPatentes { get; set; }

    public virtual DbSet<Propietario> Propietarios { get; set; }

    public virtual DbSet<PublicacionAccion> PublicacionAccions { get; set; }

    public virtual DbSet<PublicacionMarca> PublicacionMarcas { get; set; }

    public virtual DbSet<PublicacionPatente> PublicacionPatentes { get; set; }

    public virtual DbSet<Recordatorio> Recordatorios { get; set; }

    public virtual DbSet<Referencium> Referencia { get; set; }

    public virtual DbSet<Regulatorio> Regulatorios { get; set; }

    public virtual DbSet<RegulatorioFabricante> RegulatorioFabricantes { get; set; }

    public virtual DbSet<TipoAccion> TipoAccions { get; set; }

    public virtual DbSet<TipoContactoCliente> TipoContactoClientes { get; set; }

    public virtual DbSet<TipoEstado> TipoEstados { get; set; }

    public virtual DbSet<TipoEvento> TipoEventos { get; set; }

    public virtual DbSet<TipoInfraccion> TipoInfraccions { get; set; }

    public virtual DbSet<TipoMarca> TipoMarcas { get; set; }

    public virtual DbSet<TipoPatente> TipoPatentes { get; set; }

    public virtual DbSet<TipoPublicacion> TipoPublicacions { get; set; }

    public virtual DbSet<TipoReferencium> TipoReferencia { get; set; }

    public virtual DbSet<TipoSignoMarca> TipoSignoMarcas { get; set; }

    public virtual DbSet<TipoSistemaMarca> TipoSistemaMarcas { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=tcp:kattionserver.database.windows.net,1433;Initial Catalog=KattionDataBase;Persist Security Info=False;User ID=kattionadmin;Password=ka25tti29on!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=True;Connection Timeout=30;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Abogado>(entity =>
        {
            entity.HasKey(e => e.AbogadoId).HasName("PK__abogado__28696C4D21879D27");

            entity.ToTable("abogado");

            entity.Property(e => e.AbogadoId).HasColumnName("abogado_id");
            entity.Property(e => e.Apellido)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("apellido");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.Identificacion)
                .HasMaxLength(15)
                .IsUnicode(false)
                .HasColumnName("identificacion");
            entity.Property(e => e.Matricula)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("matricula");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("nombre");
            entity.Property(e => e.Telefono)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("telefono");
        });

        modelBuilder.Entity<AccionTercero>(entity =>
        {
            entity.HasKey(e => e.AccionTerceroId).HasName("PK__accion_t__0EB53502D5419706");

            entity.ToTable("accion_tercero");

            entity.Property(e => e.AccionTerceroId).HasColumnName("accion_tercero_id");
            entity.Property(e => e.AbogadoId).HasColumnName("abogado_id");
            entity.Property(e => e.Activo).HasColumnName("activo");
            entity.Property(e => e.ClienteId).HasColumnName("cliente_id");
            entity.Property(e => e.MarcaOpuesta).HasColumnName("marca_opuesta");
            entity.Property(e => e.OficinaTramitante).HasColumnName("oficina_tramitante");
            entity.Property(e => e.ReferenciaInterna)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("referencia_interna");
            entity.Property(e => e.TipoAccionId).HasColumnName("tipo_accion_id");

            entity.HasOne(d => d.Abogado).WithMany(p => p.AccionTerceros)
                .HasForeignKey(d => d.AbogadoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_accion_tercero_abogado_id");

            entity.HasOne(d => d.Cliente).WithMany(p => p.AccionTerceroClientes)
                .HasForeignKey(d => d.ClienteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__accion_te__clien__3F9B6DFF");

            entity.HasOne(d => d.MarcaOpuestaNavigation).WithMany(p => p.AccionTerceros)
                .HasForeignKey(d => d.MarcaOpuesta)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_accion_tercero_marca_opuesta");

            entity.HasOne(d => d.OficinaTramitanteNavigation).WithMany(p => p.AccionTerceroOficinaTramitanteNavigations)
                .HasForeignKey(d => d.OficinaTramitante)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_accion_tercero_oficina_tramitante");

            entity.HasOne(d => d.TipoAccion).WithMany(p => p.AccionTerceros)
                .HasForeignKey(d => d.TipoAccionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_accion_tercero_tipo_accion_id");

            entity.HasMany(d => d.Referencia).WithMany(p => p.Accions)
                .UsingEntity<Dictionary<string, object>>(
                    "ReferenciaAccion",
                    r => r.HasOne<Referencium>().WithMany()
                        .HasForeignKey("ReferenciaId")
                        .HasConstraintName("FK_referencia_accion_referencia_id"),
                    l => l.HasOne<AccionTercero>().WithMany()
                        .HasForeignKey("AccionId")
                        .HasConstraintName("FK_referencia_accion_accion_id"),
                    j =>
                    {
                        j.HasKey("AccionId", "ReferenciaId").HasName("PK__referenc__43009BA8303020B4");
                        j.ToTable("referencia_accion");
                        j.IndexerProperty<int>("AccionId").HasColumnName("accion_id");
                        j.IndexerProperty<int>("ReferenciaId").HasColumnName("referencia_id");
                    });
        });

        modelBuilder.Entity<Autoridad>(entity =>
        {
            entity.HasKey(e => e.AutoridadId).HasName("PK__autorida__57EA40942D91F6F5");

            entity.ToTable("autoridad");

            entity.Property(e => e.AutoridadId).HasColumnName("autoridad_id");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<CasoInfraccion>(entity =>
        {
            entity.HasKey(e => e.CasoInfraccionId).HasName("PK__caso_inf__520D7A1A48E45964");

            entity.ToTable("caso_infraccion");

            entity.Property(e => e.CasoInfraccionId).HasColumnName("caso_infraccion_id");
            entity.Property(e => e.NumeroCasoInfraccion)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("numero_caso_infraccion");

            entity.HasMany(d => d.Infraccions).WithMany(p => p.CasoInfraccions)
                .UsingEntity<Dictionary<string, object>>(
                    "InfraccionesCaso",
                    r => r.HasOne<Infraccion>().WithMany()
                        .HasForeignKey("InfraccionId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_infraccion_id_infracciones_caso"),
                    l => l.HasOne<CasoInfraccion>().WithMany()
                        .HasForeignKey("CasoInfraccionId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_caso_infraccion_id_caso_infraccion"),
                    j =>
                    {
                        j.HasKey("CasoInfraccionId", "InfraccionId").HasName("PK__infracci__8E0E524A07526452");
                        j.ToTable("infracciones_caso");
                        j.IndexerProperty<int>("CasoInfraccionId").HasColumnName("caso_infraccion_id");
                        j.IndexerProperty<int>("InfraccionId").HasColumnName("infraccion_id");
                    });
        });

        modelBuilder.Entity<Clase>(entity =>
        {
            entity.HasKey(e => e.Codigo).HasName("PK__clase__40F9A207193CCF7C");

            entity.ToTable("clase");

            entity.HasIndex(e => e.Codigo, "UQ__clase__40F9A206353F9BF6").IsUnique();

            entity.Property(e => e.Codigo)
                .ValueGeneratedNever()
                .HasColumnName("codigo");
            entity.Property(e => e.DescripcionEspanol)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("descripcion_espanol");
            entity.Property(e => e.DescripcionIngles)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("descripcion_ingles");
        });

        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.HasKey(e => e.ClienteId).HasName("PK__cliente__47E34D64C1C78299");

            entity.ToTable("cliente");

            entity.Property(e => e.ClienteId).HasColumnName("cliente_id");
            entity.Property(e => e.Ciudad)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("ciudad");
            entity.Property(e => e.ClaveWeb)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("clave_web");
            entity.Property(e => e.CodigoIdioma)
                .HasMaxLength(4)
                .IsUnicode(false)
                .HasColumnName("codigo_idioma");
            entity.Property(e => e.CodigoPais)
                .HasMaxLength(4)
                .IsUnicode(false)
                .HasColumnName("codigo_pais");
            entity.Property(e => e.Direccion)
                .HasMaxLength(2000)
                .IsUnicode(false)
                .HasColumnName("direccion");
            entity.Property(e => e.Email)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.EstadoProvincia)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("estado_provincia");
            entity.Property(e => e.Nombre)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("nombre");
            entity.Property(e => e.Notas)
                .HasMaxLength(2000)
                .IsUnicode(false)
                .HasColumnName("notas");
            entity.Property(e => e.Telefono)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("telefono");
            entity.Property(e => e.UsuarioWeb)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("usuario_web");
            entity.Property(e => e.Web)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("web");

            entity.HasOne(d => d.CodigoIdiomaNavigation).WithMany(p => p.Clientes)
                .HasForeignKey(d => d.CodigoIdioma)
                .HasConstraintName("FK_cliente_codigo_idioma");

            entity.HasOne(d => d.CodigoPaisNavigation).WithMany(p => p.Clientes)
                .HasForeignKey(d => d.CodigoPais)
                .HasConstraintName("FK_cliente_codigo_pais");
        });

        modelBuilder.Entity<ConexionComentario>(entity =>
        {
            entity.HasKey(e => e.ConexionComentarioId).HasName("PK__conexion__2FFFDC77AC3010B3");

            entity.ToTable("conexion_comentario");

            entity.Property(e => e.ConexionComentarioId).HasColumnName("conexion_comentario_id");
            entity.Property(e => e.Comentario)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("comentario");
            entity.Property(e => e.Fecha)
                .HasColumnType("date")
                .HasColumnName("fecha");
            entity.Property(e => e.IdConexion).HasColumnName("id_conexion");
            entity.Property(e => e.TablaConexion)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("tabla_conexion");
            entity.Property(e => e.Titulo)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("titulo");
            entity.Property(e => e.Usuario)
                .HasMaxLength(40)
                .IsUnicode(false)
                .HasColumnName("usuario");
        });

        modelBuilder.Entity<ConexionCorreo>(entity =>
        {
            entity.HasKey(e => e.ConexionCorreoId).HasName("PK__conexion__2FA6ABC621840B3D");

            entity.ToTable("conexion_correo");

            entity.Property(e => e.ConexionCorreoId).HasColumnName("conexion_correo_id");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("descripcion");
            entity.Property(e => e.Fecha)
                .HasColumnType("date")
                .HasColumnName("fecha");
            entity.Property(e => e.IdConexion).HasColumnName("id_conexion");
            entity.Property(e => e.NombreCorreo)
                .HasMaxLength(255)
                .HasColumnName("nombre_correo");
            entity.Property(e => e.TablaConexion)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("tabla_conexion");
            entity.Property(e => e.Titulo)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("titulo");
            entity.Property(e => e.Usuario)
                .HasMaxLength(40)
                .IsUnicode(false)
                .HasColumnName("usuario");
        });

        modelBuilder.Entity<ConexionDocumento>(entity =>
        {
            entity.HasKey(e => e.ConexionDocumentoId).HasName("PK__conexion__22A5B52799A38C5E");

            entity.ToTable("conexion_documento");

            entity.Property(e => e.ConexionDocumentoId).HasColumnName("conexion_documento_id");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("descripcion");
            entity.Property(e => e.Fecha)
                .HasColumnType("date")
                .HasColumnName("fecha");
            entity.Property(e => e.IdConexion).HasColumnName("id_conexion");
            entity.Property(e => e.NombreArchivo)
                .HasMaxLength(255)
                .HasColumnName("nombre_archivo");
            entity.Property(e => e.TablaConexion)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("tabla_conexion");
            entity.Property(e => e.Titulo)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("titulo");
            entity.Property(e => e.Usuario)
                .HasMaxLength(40)
                .IsUnicode(false)
                .HasColumnName("usuario");
        });

        modelBuilder.Entity<ConexionEvento>(entity =>
        {
            entity.HasKey(e => e.ConexionEventoId).HasName("PK__conexion__0E904996018FB15B");

            entity.ToTable("conexion_evento");

            entity.Property(e => e.ConexionEventoId).HasColumnName("conexion_evento_id");
            entity.Property(e => e.IdConexion).HasColumnName("id_conexion");
            entity.Property(e => e.IdEvento).HasColumnName("id_evento");
            entity.Property(e => e.TablaConexion)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("tabla_conexion");
            entity.Property(e => e.TablaConexionEvento)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("tabla_conexion_evento");
        });

        modelBuilder.Entity<ConexionLogo>(entity =>
        {
            entity.HasKey(e => e.MarcaId).HasName("PK__Conexion__BBC43191C43ACD0D");

            entity.ToTable("ConexionLogo");

            entity.Property(e => e.MarcaId)
                .ValueGeneratedNever()
                .HasColumnName("marca_id");
            entity.Property(e => e.NombreArchivo)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("nombre_archivo");
        });

        modelBuilder.Entity<ContactosCliente>(entity =>
        {
            entity.HasKey(e => e.ContactoId).HasName("PK__contacto__4B26960F20A87004");

            entity.ToTable("contactos_cliente");

            entity.Property(e => e.ContactoId).HasColumnName("contacto_id");
            entity.Property(e => e.Apellido)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("apellido");
            entity.Property(e => e.Cargo)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("cargo");
            entity.Property(e => e.ClienteId).HasColumnName("cliente_id");
            entity.Property(e => e.CodigoIdioma)
                .HasMaxLength(4)
                .IsUnicode(false)
                .HasColumnName("codigo_idioma");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("nombre");
            entity.Property(e => e.Telefono)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("telefono");
            entity.Property(e => e.TipoContactoClienteId).HasColumnName("tipo_contacto_cliente_id");

            entity.HasOne(d => d.Cliente).WithMany(p => p.ContactosClientes)
                .HasForeignKey(d => d.ClienteId)
                .HasConstraintName("FK_contactos_cliente_cliente_id");

            entity.HasOne(d => d.CodigoIdiomaNavigation).WithMany(p => p.ContactosClientes)
                .HasForeignKey(d => d.CodigoIdioma)
                .HasConstraintName("FK_contactos_cliente_codigo_idioma");

            entity.HasOne(d => d.TipoContactoCliente).WithMany(p => p.ContactosClientes)
                .HasForeignKey(d => d.TipoContactoClienteId)
                .HasConstraintName("FK_contactos_cliente_tipo_contacto_cliente_id");

            entity.HasMany(d => d.Marcas).WithMany(p => p.Contactos)
                .UsingEntity<Dictionary<string, object>>(
                    "ContactosClienteMarca",
                    r => r.HasOne<Marca>().WithMany()
                        .HasForeignKey("MarcaId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_contactos_cliente_marca_marca_id"),
                    l => l.HasOne<ContactosCliente>().WithMany()
                        .HasForeignKey("ContactoId")
                        .HasConstraintName("FK_contactos_cliente_marca_contacto_id"),
                    j =>
                    {
                        j.HasKey("ContactoId", "MarcaId").HasName("PK__contacto__409AD516536C8A87");
                        j.ToTable("contactos_cliente_marca");
                        j.IndexerProperty<int>("ContactoId").HasColumnName("contacto_id");
                        j.IndexerProperty<int>("MarcaId").HasColumnName("marca_id");
                    });

            entity.HasMany(d => d.Patentes).WithMany(p => p.Contactos)
                .UsingEntity<Dictionary<string, object>>(
                    "ContactosClientePatente",
                    r => r.HasOne<Patente>().WithMany()
                        .HasForeignKey("PatenteId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_contactos_cliente_patente_patente_id"),
                    l => l.HasOne<ContactosCliente>().WithMany()
                        .HasForeignKey("ContactoId")
                        .HasConstraintName("FK_contactos_cliente_patente_contacto_id"),
                    j =>
                    {
                        j.HasKey("ContactoId", "PatenteId").HasName("PK__contacto__4F4142F9DF08F405");
                        j.ToTable("contactos_cliente_patente");
                        j.IndexerProperty<int>("ContactoId").HasColumnName("contacto_id");
                        j.IndexerProperty<int>("PatenteId").HasColumnName("patente_id");
                    });

            entity.HasMany(d => d.Regulatorios).WithMany(p => p.Contactos)
                .UsingEntity<Dictionary<string, object>>(
                    "ContactosClienteRegulatorio",
                    r => r.HasOne<Regulatorio>().WithMany()
                        .HasForeignKey("RegulatorioId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_contactos_cliente_regulatorio_regulatorio_id"),
                    l => l.HasOne<ContactosCliente>().WithMany()
                        .HasForeignKey("ContactoId")
                        .HasConstraintName("FK_contactos_cliente_regulatorio_contacto_id"),
                    j =>
                    {
                        j.HasKey("ContactoId", "RegulatorioId").HasName("PK__contacto__F9869DF1E940A2DF");
                        j.ToTable("contactos_cliente_regulatorio");
                        j.IndexerProperty<int>("ContactoId").HasColumnName("contacto_id");
                        j.IndexerProperty<int>("RegulatorioId").HasColumnName("regulatorio_id");
                    });
        });

        modelBuilder.Entity<Estado>(entity =>
        {
            entity.HasKey(e => e.Codigo).HasName("PK__estado__40F9A207CC66CA4B");

            entity.ToTable("estado");

            entity.HasIndex(e => e.Codigo, "UQ__estado__40F9A206C54A347B").IsUnique();

            entity.Property(e => e.Codigo)
                .HasMaxLength(8)
                .IsUnicode(false)
                .HasColumnName("codigo");
            entity.Property(e => e.Color)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("color");
            entity.Property(e => e.DescripcionEspanol)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("descripcion_espanol");
            entity.Property(e => e.DescripcionIngles)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("descripcion_ingles");
            entity.Property(e => e.NombreColor)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("nombre_color");
            entity.Property(e => e.TipoEstadoId)
                .HasMaxLength(8)
                .IsUnicode(false)
                .HasColumnName("tipo_estado_id");

            entity.HasOne(d => d.TipoEstado).WithMany(p => p.Estados)
                .HasForeignKey(d => d.TipoEstadoId)
                .HasConstraintName("FK_estado_tipo_estado_id");
        });

        modelBuilder.Entity<EstadoAccion>(entity =>
        {
            entity.HasKey(e => new { e.EstadoId, e.AccionTerceroId }).HasName("PK__estado_a__35DC27BFA3FF97C8");

            entity.ToTable("estado_accion");

            entity.Property(e => e.EstadoId)
                .HasMaxLength(8)
                .IsUnicode(false)
                .HasColumnName("estado_id");
            entity.Property(e => e.AccionTerceroId).HasColumnName("accion_tercero_id");

            entity.HasOne(d => d.Estado).WithMany(p => p.EstadoAccions)
                .HasForeignKey(d => d.EstadoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_estado_accion_estado_id");
        });

        modelBuilder.Entity<EstadoInfraccion>(entity =>
        {
            entity.HasKey(e => new { e.EstadoId, e.InfraccionId }).HasName("PK__estado_i__D9345CBFE011B5A2");

            entity.ToTable("estado_infraccion");

            entity.Property(e => e.EstadoId)
                .HasMaxLength(8)
                .IsUnicode(false)
                .HasColumnName("estado_id");
            entity.Property(e => e.InfraccionId).HasColumnName("infraccion_id");

            entity.HasOne(d => d.Estado).WithMany(p => p.EstadoInfraccions)
                .HasForeignKey(d => d.EstadoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_estado_infraccion_estado_id");
        });

        modelBuilder.Entity<EstadoMarca>(entity =>
        {
            entity.HasKey(e => new { e.EstadoId, e.MarcaId }).HasName("PK__estado_m__0E8B37F69CAFE54D");

            entity.ToTable("estado_marca");

            entity.Property(e => e.EstadoId)
                .HasMaxLength(8)
                .IsUnicode(false)
                .HasColumnName("estado_id");
            entity.Property(e => e.MarcaId).HasColumnName("marca_id");

            entity.HasOne(d => d.Estado).WithMany(p => p.EstadoMarcas)
                .HasForeignKey(d => d.EstadoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_estado_marca_estado_id");
        });

        modelBuilder.Entity<EstadoPatente>(entity =>
        {
            entity.HasKey(e => new { e.EstadoId, e.PatenteId }).HasName("PK__estado_p__0150A019EEB1B658");

            entity.ToTable("estado_patente");

            entity.Property(e => e.EstadoId)
                .HasMaxLength(8)
                .IsUnicode(false)
                .HasColumnName("estado_id");
            entity.Property(e => e.PatenteId).HasColumnName("patente_id");

            entity.HasOne(d => d.Estado).WithMany(p => p.EstadoPatentes)
                .HasForeignKey(d => d.EstadoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_estado_patente_estado_id");
        });

        modelBuilder.Entity<Evento1>(entity =>
        {
            entity.HasKey(e => e.EventoId).HasName("PK__evento1__1850C3ADDF5B6904");

            entity.ToTable("evento1");

            entity.Property(e => e.EventoId).HasColumnName("evento_id");
            entity.Property(e => e.EstadoCodigo)
                .HasMaxLength(8)
                .IsUnicode(false)
                .HasColumnName("estado_codigo");
            entity.Property(e => e.Fecha)
                .HasColumnType("date")
                .HasColumnName("fecha");
            entity.Property(e => e.TipoEventoId).HasColumnName("tipo_evento_id");

            entity.HasOne(d => d.EstadoCodigoNavigation).WithMany(p => p.Evento1s)
                .HasForeignKey(d => d.EstadoCodigo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_evento1_estado_codigo");

            entity.HasOne(d => d.TipoEvento).WithMany(p => p.Evento1s)
                .HasForeignKey(d => d.TipoEventoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_evento1_tipo_evento");
        });

        modelBuilder.Entity<Evento2>(entity =>
        {
            entity.HasKey(e => e.EventoId).HasName("PK__evento2__1850C3AD6F11BD57");

            entity.ToTable("evento2");

            entity.Property(e => e.EventoId).HasColumnName("evento_id");
            entity.Property(e => e.Agente)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("agente");
            entity.Property(e => e.ClaseId).HasColumnName("clase_id");
            entity.Property(e => e.EstadoCodigo)
                .HasMaxLength(8)
                .IsUnicode(false)
                .HasColumnName("estado_codigo");
            entity.Property(e => e.FechaRegistro)
                .HasColumnType("date")
                .HasColumnName("fecha_registro");
            entity.Property(e => e.MarcaOpuesta)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("marca_opuesta");
            entity.Property(e => e.Propietario)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("propietario");
            entity.Property(e => e.Registro)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("registro");
            entity.Property(e => e.TipoEventoId).HasColumnName("tipo_evento_id");

            entity.HasOne(d => d.Clase).WithMany(p => p.Evento2s)
                .HasForeignKey(d => d.ClaseId)
                .HasConstraintName("FK_evento2_clase_id");

            entity.HasOne(d => d.EstadoCodigoNavigation).WithMany(p => p.Evento2s)
                .HasForeignKey(d => d.EstadoCodigo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_evento2_estado_codigo");

            entity.HasOne(d => d.TipoEvento).WithMany(p => p.Evento2s)
                .HasForeignKey(d => d.TipoEventoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_evento2_tipo_evento");
        });

        modelBuilder.Entity<Evento3>(entity =>
        {
            entity.HasKey(e => e.EventoId).HasName("PK__evento3__1850C3ADA0FCAA1A");

            entity.ToTable("evento3");

            entity.Property(e => e.EventoId).HasColumnName("evento_id");
            entity.Property(e => e.EstadoCodigo)
                .HasMaxLength(8)
                .IsUnicode(false)
                .HasColumnName("estado_codigo");
            entity.Property(e => e.FechaRegistro)
                .HasColumnType("date")
                .HasColumnName("fecha_registro");
            entity.Property(e => e.FechaSolicitud)
                .HasColumnType("date")
                .HasColumnName("fecha_solicitud");
            entity.Property(e => e.FechaVigenciaDesde)
                .HasColumnType("date")
                .HasColumnName("fecha_vigencia_desde");
            entity.Property(e => e.FechaVigenciaHasta)
                .HasColumnType("date")
                .HasColumnName("fecha_vigencia_hasta");
            entity.Property(e => e.Registro)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("registro");
            entity.Property(e => e.Solicitud)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("solicitud");
            entity.Property(e => e.TipoEventoId).HasColumnName("tipo_evento_id");

            entity.HasOne(d => d.EstadoCodigoNavigation).WithMany(p => p.Evento3s)
                .HasForeignKey(d => d.EstadoCodigo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_evento3_estado_codigo");

            entity.HasOne(d => d.TipoEvento).WithMany(p => p.Evento3s)
                .HasForeignKey(d => d.TipoEventoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_evento3_tipo_evento");
        });

        modelBuilder.Entity<Evento4>(entity =>
        {
            entity.HasKey(e => e.EventoId).HasName("PK__evento4__1850C3ADDCD6089E");

            entity.ToTable("evento4");

            entity.Property(e => e.EventoId).HasColumnName("evento_id");
            entity.Property(e => e.EstadoCodigo)
                .HasMaxLength(8)
                .IsUnicode(false)
                .HasColumnName("estado_codigo");
            entity.Property(e => e.FechaRegistro)
                .HasColumnType("date")
                .HasColumnName("fecha_registro");
            entity.Property(e => e.FechaSolicitud)
                .HasColumnType("date")
                .HasColumnName("fecha_solicitud");
            entity.Property(e => e.Registro)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("registro");
            entity.Property(e => e.Solicitud)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("solicitud");
            entity.Property(e => e.TipoEventoId).HasColumnName("tipo_evento_id");

            entity.HasOne(d => d.EstadoCodigoNavigation).WithMany(p => p.Evento4s)
                .HasForeignKey(d => d.EstadoCodigo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_evento4_estado_codigo");

            entity.HasOne(d => d.TipoEvento).WithMany(p => p.Evento4s)
                .HasForeignKey(d => d.TipoEventoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_evento4_tipo_evento");
        });

        modelBuilder.Entity<Gacetum>(entity =>
        {
            entity.HasKey(e => e.Numero).HasName("PK__gaceta__FC77F210FC001A56");

            entity.ToTable("gaceta");

            entity.Property(e => e.Numero)
                .ValueGeneratedNever()
                .HasColumnName("numero");
            entity.Property(e => e.CodigoPais)
                .HasMaxLength(4)
                .IsUnicode(false)
                .HasColumnName("codigo_pais");
            entity.Property(e => e.Fecha)
                .HasColumnType("date")
                .HasColumnName("fecha");
            entity.Property(e => e.UrlGaceta)
                .HasMaxLength(300)
                .IsUnicode(false)
                .HasColumnName("url_gaceta");

            entity.HasOne(d => d.CodigoPaisNavigation).WithMany(p => p.Gaceta)
                .HasForeignKey(d => d.CodigoPais)
                .HasConstraintName("FK_gaceta_codigo_pais");
        });

        modelBuilder.Entity<Grupo>(entity =>
        {
            entity.HasKey(e => e.GrupoId).HasName("PK__grupo__90617DE16F56C11B");

            entity.ToTable("grupo");

            entity.Property(e => e.GrupoId).HasColumnName("grupo_id");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<GrupoDosEvento4>(entity =>
        {
            entity.HasKey(e => e.GrupoDosEvento4Id).HasName("PK__grupo_do__909B7A8B6380DF67");

            entity.ToTable("grupo_dos_evento4");

            entity.Property(e => e.GrupoDosEvento4Id).HasColumnName("grupo_dos_evento4_id");
            entity.Property(e => e.EventoId).HasColumnName("evento_id");
            entity.Property(e => e.PropietarioId).HasColumnName("propietario_id");

            entity.HasOne(d => d.Evento).WithMany(p => p.GrupoDosEvento4s)
                .HasForeignKey(d => d.EventoId)
                .HasConstraintName("FK_grupo_dos_evento4_id_evento_id");

            entity.HasOne(d => d.Propietario).WithMany(p => p.GrupoDosEvento4s)
                .HasForeignKey(d => d.PropietarioId)
                .HasConstraintName("FK_grupo_dos_evento4_id_propietario_id");
        });

        modelBuilder.Entity<GrupoUnoEvento4>(entity =>
        {
            entity.HasKey(e => e.GrupoUnoEvento4Id).HasName("PK__grupo_un__24E3C3ADC931D3DD");

            entity.ToTable("grupo_uno_evento4");

            entity.Property(e => e.GrupoUnoEvento4Id).HasColumnName("grupo_uno_evento4_id");
            entity.Property(e => e.EventoId).HasColumnName("evento_id");
            entity.Property(e => e.PropietarioId).HasColumnName("propietario_id");

            entity.HasOne(d => d.Evento).WithMany(p => p.GrupoUnoEvento4s)
                .HasForeignKey(d => d.EventoId)
                .HasConstraintName("FK_grupo_uno_evento4_id_evento_id");

            entity.HasOne(d => d.Propietario).WithMany(p => p.GrupoUnoEvento4s)
                .HasForeignKey(d => d.PropietarioId)
                .HasConstraintName("FK_grupo_uno_evento4_id_propietario_id");
        });

        modelBuilder.Entity<Idioma>(entity =>
        {
            entity.HasKey(e => e.CodigoIdioma).HasName("PK__idioma__1CDD4F82F6BE3412");

            entity.ToTable("idioma");

            entity.Property(e => e.CodigoIdioma)
                .HasMaxLength(4)
                .IsUnicode(false)
                .HasColumnName("codigo_idioma");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<Infraccion>(entity =>
        {
            entity.HasKey(e => e.InfraccionId).HasName("PK__infracci__C032850CC9E7DC47");

            entity.ToTable("infraccion");

            entity.Property(e => e.InfraccionId).HasColumnName("infraccion_id");
            entity.Property(e => e.AbogadoId).HasColumnName("abogado_id");
            entity.Property(e => e.Activo).HasColumnName("activo");
            entity.Property(e => e.AutoridadId).HasColumnName("autoridad_id");
            entity.Property(e => e.ClaseInfractor).HasColumnName("clase_infractor");
            entity.Property(e => e.ClaseMarca).HasColumnName("clase_marca");
            entity.Property(e => e.CodigoDai)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("codigo_dai");
            entity.Property(e => e.CodigoPaisInfractor)
                .HasMaxLength(4)
                .IsUnicode(false)
                .HasColumnName("codigo_pais_infractor");
            entity.Property(e => e.CodigoPaisMarca)
                .HasMaxLength(4)
                .IsUnicode(false)
                .HasColumnName("codigo_pais_marca");
            entity.Property(e => e.FechaRegistro)
                .HasColumnType("date")
                .HasColumnName("fecha_registro");
            entity.Property(e => e.Infractor)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("infractor");
            entity.Property(e => e.MarcaId).HasColumnName("marca_id");
            entity.Property(e => e.NumeroProceso)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("numero_proceso");
            entity.Property(e => e.NumeroProcesoJudicial)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("numero_proceso_judicial");
            entity.Property(e => e.OficinaTramitante).HasColumnName("oficina_tramitante");
            entity.Property(e => e.ReferenciaInterna)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("referencia_interna");
            entity.Property(e => e.TipoInfraccionId).HasColumnName("tipo_infraccion_id");

            entity.HasOne(d => d.Abogado).WithMany(p => p.Infraccions)
                .HasForeignKey(d => d.AbogadoId)
                .HasConstraintName("FK_infraccion_abogado_id");

            entity.HasOne(d => d.Autoridad).WithMany(p => p.Infraccions)
                .HasForeignKey(d => d.AutoridadId)
                .HasConstraintName("FK_infraccion_autoridad_id");

            entity.HasOne(d => d.ClaseInfractorNavigation).WithMany(p => p.InfraccionClaseInfractorNavigations)
                .HasForeignKey(d => d.ClaseInfractor)
                .HasConstraintName("FK_infraccion_clase_infractor");

            entity.HasOne(d => d.ClaseMarcaNavigation).WithMany(p => p.InfraccionClaseMarcaNavigations)
                .HasForeignKey(d => d.ClaseMarca)
                .HasConstraintName("FK_infraccion_clase_marca");

            entity.HasOne(d => d.CodigoPaisInfractorNavigation).WithMany(p => p.InfraccionCodigoPaisInfractorNavigations)
                .HasForeignKey(d => d.CodigoPaisInfractor)
                .HasConstraintName("FK__infraccio__codig__3BCADD1B");

            entity.HasOne(d => d.CodigoPaisMarcaNavigation).WithMany(p => p.InfraccionCodigoPaisMarcaNavigations)
                .HasForeignKey(d => d.CodigoPaisMarca)
                .HasConstraintName("FK__infraccio__codig__3AD6B8E2");

            entity.HasOne(d => d.Marca).WithMany(p => p.Infraccions)
                .HasForeignKey(d => d.MarcaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_infraccion_marca_id");

            entity.HasOne(d => d.OficinaTramitanteNavigation).WithMany(p => p.Infraccions)
                .HasForeignKey(d => d.OficinaTramitante)
                .HasConstraintName("FK_infraccion_oficina_tramitante");

            entity.HasOne(d => d.TipoInfraccion).WithMany(p => p.Infraccions)
                .HasForeignKey(d => d.TipoInfraccionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_infraccion_tipo_infraccion_id");
        });

        modelBuilder.Entity<InstanciasRecordatorio>(entity =>
        {
            entity.HasKey(e => e.InstanciasRecordatorioId).HasName("PK__instanci__E373E6D414C05CB3");

            entity.ToTable("instancias_recordatorio");

            entity.Property(e => e.InstanciasRecordatorioId).HasColumnName("instancias_recordatorio_id");
            entity.Property(e => e.Activo).HasColumnName("activo");
            entity.Property(e => e.Fecha)
                .HasColumnType("date")
                .HasColumnName("fecha");
            entity.Property(e => e.RecordatorioId).HasColumnName("recordatorio_id");

            entity.HasOne(d => d.Recordatorio).WithMany(p => p.InstanciasRecordatorios)
                .HasForeignKey(d => d.RecordatorioId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_instancias_recordatorio_recordatorio_id");
        });

        modelBuilder.Entity<Inventor>(entity =>
        {
            entity.HasKey(e => e.InventorId).HasName("PK__inventor__DC68777F6D3412C2");

            entity.ToTable("inventor");

            entity.Property(e => e.InventorId).HasColumnName("inventor_id");
            entity.Property(e => e.Apellido)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("apellido");
            entity.Property(e => e.CodigoPais)
                .HasMaxLength(4)
                .IsUnicode(false)
                .HasColumnName("codigo_pais");
            entity.Property(e => e.Direccion)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("direccion");
            entity.Property(e => e.Nombre)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("nombre");

            entity.HasOne(d => d.CodigoPaisNavigation).WithMany(p => p.Inventors)
                .HasForeignKey(d => d.CodigoPais)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_inventor_codigo_pais");

            entity.HasMany(d => d.Patentes).WithMany(p => p.Inventors)
                .UsingEntity<Dictionary<string, object>>(
                    "InventoresPatente",
                    r => r.HasOne<Patente>().WithMany()
                        .HasForeignKey("PatenteId")
                        .HasConstraintName("FK_inventores_patente_patente_id"),
                    l => l.HasOne<Inventor>().WithMany()
                        .HasForeignKey("InventorId")
                        .HasConstraintName("FK_inventores_patente_inventor_id"),
                    j =>
                    {
                        j.HasKey("InventorId", "PatenteId").HasName("PK__inventor__D80FA389F605A164");
                        j.ToTable("inventores_patente");
                        j.IndexerProperty<int>("InventorId").HasColumnName("inventor_id");
                        j.IndexerProperty<int>("PatenteId").HasColumnName("patente_id");
                    });
        });

        modelBuilder.Entity<Marca>(entity =>
        {
            entity.HasKey(e => e.MarcaId).HasName("PK__marca__BBC431913CB4F6B8");

            entity.ToTable("marca");

            entity.Property(e => e.MarcaId).HasColumnName("marca_id");
            entity.Property(e => e.Abogado).HasColumnName("abogado");
            entity.Property(e => e.AbogadoInternacional)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("abogado_internacional");
            entity.Property(e => e.Activo).HasColumnName("activo");
            entity.Property(e => e.Caja)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("caja");
            entity.Property(e => e.Certificado)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("certificado");
            entity.Property(e => e.ClienteId).HasColumnName("cliente_id");
            entity.Property(e => e.Comparacion).HasColumnName("comparacion");
            entity.Property(e => e.FechaCertificado)
                .HasColumnType("date")
                .HasColumnName("fecha_certificado");
            entity.Property(e => e.FechaRegistro)
                .HasColumnType("date")
                .HasColumnName("fecha_registro");
            entity.Property(e => e.FechaSolicitud)
                .HasColumnType("date")
                .HasColumnName("fecha_solicitud");
            entity.Property(e => e.OficinaTramitante).HasColumnName("oficina_tramitante");
            entity.Property(e => e.PrimerUso)
                .HasColumnType("date")
                .HasColumnName("primer_uso");
            entity.Property(e => e.PruebaUso)
                .HasColumnType("date")
                .HasColumnName("prueba_uso");
            entity.Property(e => e.ReferenciaInterna)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("referencia_interna");
            entity.Property(e => e.Registro)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("registro");
            entity.Property(e => e.Signo)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("signo");
            entity.Property(e => e.Solicitud)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("solicitud");
            entity.Property(e => e.TieneFigura).HasColumnName("tiene_figura");
            entity.Property(e => e.TipoMarcaId).HasColumnName("tipo_marca_id");
            entity.Property(e => e.TipoSignoMarcaId).HasColumnName("tipo_signo_marca_id");
            entity.Property(e => e.TipoSistemaMarcaId).HasColumnName("tipo_sistema_marca_id");
            entity.Property(e => e.Vencimiento)
                .HasColumnType("date")
                .HasColumnName("vencimiento");

            entity.HasOne(d => d.AbogadoNavigation).WithMany(p => p.Marcas)
                .HasForeignKey(d => d.Abogado)
                .HasConstraintName("FK_marca_abogado");

            entity.HasOne(d => d.Cliente).WithMany(p => p.MarcaClientes)
                .HasForeignKey(d => d.ClienteId)
                .HasConstraintName("FK_marca_cliente_id");

            entity.HasOne(d => d.OficinaTramitanteNavigation).WithMany(p => p.MarcaOficinaTramitanteNavigations)
                .HasForeignKey(d => d.OficinaTramitante)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_marca_oficina_tramitante");

            entity.HasOne(d => d.TipoMarca).WithMany(p => p.Marcas)
                .HasForeignKey(d => d.TipoMarcaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_marca_tipo_marca_id");

            entity.HasOne(d => d.TipoSignoMarca).WithMany(p => p.Marcas)
                .HasForeignKey(d => d.TipoSignoMarcaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_marca_tipo_signo_marca_id");

            entity.HasOne(d => d.TipoSistemaMarca).WithMany(p => p.Marcas)
                .HasForeignKey(d => d.TipoSistemaMarcaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_marca_tipo_sistema_marca_id");

            entity.HasMany(d => d.CodigoPais).WithMany(p => p.Marcas)
                .UsingEntity<Dictionary<string, object>>(
                    "MarcaPai",
                    r => r.HasOne<Pai>().WithMany()
                        .HasForeignKey("CodigoPais")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_marca_pais_codigo_pais"),
                    l => l.HasOne<Marca>().WithMany()
                        .HasForeignKey("MarcaId")
                        .HasConstraintName("FK_marca_pais_marca_id"),
                    j =>
                    {
                        j.HasKey("MarcaId", "CodigoPais").HasName("PK__marca_pa__33771098390C3179");
                        j.ToTable("marca_pais");
                        j.IndexerProperty<int>("MarcaId").HasColumnName("marca_id");
                        j.IndexerProperty<string>("CodigoPais")
                            .HasMaxLength(4)
                            .IsUnicode(false)
                            .HasColumnName("codigo_pais");
                    });

            entity.HasMany(d => d.Propietarios).WithMany(p => p.Marcas)
                .UsingEntity<Dictionary<string, object>>(
                    "MarcaPropietario",
                    r => r.HasOne<Propietario>().WithMany()
                        .HasForeignKey("PropietarioId")
                        .HasConstraintName("FK_marca_propietario_propietario_id"),
                    l => l.HasOne<Marca>().WithMany()
                        .HasForeignKey("MarcaId")
                        .HasConstraintName("FK_marca_propietario_marca_id"),
                    j =>
                    {
                        j.HasKey("MarcaId", "PropietarioId").HasName("PK__marca_pr__E801411961E137A1");
                        j.ToTable("marca_propietario");
                        j.IndexerProperty<int>("MarcaId").HasColumnName("marca_id");
                        j.IndexerProperty<int>("PropietarioId").HasColumnName("propietario_id");
                    });

            entity.HasMany(d => d.Referencia).WithMany(p => p.Marcas)
                .UsingEntity<Dictionary<string, object>>(
                    "ReferenciaMarca",
                    r => r.HasOne<Referencium>().WithMany()
                        .HasForeignKey("ReferenciaId")
                        .HasConstraintName("FK_referencia_marca_referencia_id"),
                    l => l.HasOne<Marca>().WithMany()
                        .HasForeignKey("MarcaId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_referencia_marca_marca_id"),
                    j =>
                    {
                        j.HasKey("MarcaId", "ReferenciaId").HasName("PK__referenc__B07D3B252A5F2066");
                        j.ToTable("referencia_marca");
                        j.IndexerProperty<int>("MarcaId").HasColumnName("marca_id");
                        j.IndexerProperty<int>("ReferenciaId").HasColumnName("referencia_id");
                    });
        });

        modelBuilder.Entity<MarcaBase>(entity =>
        {
            entity.ToTable("marca_base");

            entity.Property(e => e.MarcaBaseId).HasColumnName("marca_base_id");
            entity.Property(e => e.AccionTerceroId).HasColumnName("accion_tercero_id");
            entity.Property(e => e.Clase).HasColumnName("clase");
            entity.Property(e => e.CodigoPais)
                .HasMaxLength(4)
                .IsUnicode(false)
                .HasColumnName("codigo_pais");
            entity.Property(e => e.MarcaId).HasColumnName("marca_id");
            entity.Property(e => e.Propietario).HasColumnName("propietario");

            entity.HasOne(d => d.AccionTercero).WithMany(p => p.MarcaBases)
                .HasForeignKey(d => d.AccionTerceroId)
                .HasConstraintName("FK_marca_base_accion_tercero_id");

            entity.HasOne(d => d.CodigoPaisNavigation).WithMany(p => p.MarcaBases)
                .HasForeignKey(d => d.CodigoPais)
                .HasConstraintName("FK_marca_base_pais");

            entity.HasOne(d => d.Marca).WithMany(p => p.MarcaBases)
                .HasForeignKey(d => d.MarcaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_marca_base_marca_id");

            entity.HasOne(d => d.PropietarioNavigation).WithMany(p => p.MarcaBases)
                .HasForeignKey(d => d.Propietario)
                .HasConstraintName("FK_marcabase_propietario");
        });

        modelBuilder.Entity<MarcaClase>(entity =>
        {
            entity.HasKey(e => new { e.MarcaId, e.CodigoClase }).HasName("PK__marca_cl__63C38A2A46FFCDC1");

            entity.ToTable("marca_clase");

            entity.Property(e => e.MarcaId).HasColumnName("marca_id");
            entity.Property(e => e.CodigoClase).HasColumnName("codigo_clase");
            entity.Property(e => e.CoberturaEspanol)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("cobertura_espanol");
            entity.Property(e => e.CoberturaIngles)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("cobertura_ingles");

            entity.HasOne(d => d.CodigoClaseNavigation).WithMany(p => p.MarcaClases)
                .HasForeignKey(d => d.CodigoClase)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_marca_clase_codigo_clase");

            entity.HasOne(d => d.Marca).WithMany(p => p.MarcaClases)
                .HasForeignKey(d => d.MarcaId)
                .HasConstraintName("FK_marca_clase_marca_id");
        });

        modelBuilder.Entity<MarcaOpuestum>(entity =>
        {
            entity.HasKey(e => e.MarcaOpuestaId).HasName("PK__marca_op__0708C522D2E5D953");

            entity.ToTable("marca_opuesta");

            entity.Property(e => e.MarcaOpuestaId).HasColumnName("marca_opuesta_id");
            entity.Property(e => e.Agente)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("agente");
            entity.Property(e => e.Clase).HasColumnName("clase");
            entity.Property(e => e.CodigoPais)
                .HasMaxLength(4)
                .IsUnicode(false)
                .HasColumnName("codigo_pais");
            entity.Property(e => e.Denominacion)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("denominacion");
            entity.Property(e => e.Fecha)
                .HasColumnType("date")
                .HasColumnName("fecha");
            entity.Property(e => e.FechaRegistro)
                .HasColumnType("date")
                .HasColumnName("fecha_registro");
            entity.Property(e => e.FechaSolicitud)
                .HasColumnType("date")
                .HasColumnName("fecha_solicitud");
            entity.Property(e => e.Gaceta).HasColumnName("gaceta");
            entity.Property(e => e.Propietario)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("propietario");
            entity.Property(e => e.Registro)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("registro");
            entity.Property(e => e.Solicitud)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("solicitud");

            entity.HasOne(d => d.ClaseNavigation).WithMany(p => p.MarcaOpuesta)
                .HasForeignKey(d => d.Clase)
                .HasConstraintName("FK_marca_opuesta_clase");

            entity.HasOne(d => d.CodigoPaisNavigation).WithMany(p => p.MarcaOpuesta)
                .HasForeignKey(d => d.CodigoPais)
                .HasConstraintName("FK_marca_opuesta_codigo_pais");

            entity.HasOne(d => d.GacetaNavigation).WithMany(p => p.MarcaOpuesta)
                .HasForeignKey(d => d.Gaceta)
                .HasConstraintName("FK_marca_opuesta_gaceta");
        });

        modelBuilder.Entity<PagosPatente>(entity =>
        {
            entity.HasKey(e => e.PagosPatenteId).HasName("PK__pagos_pa__B91B34BE5AEF6464");

            entity.ToTable("pagos_patente");

            entity.Property(e => e.PagosPatenteId).HasColumnName("pagos_patente_id");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("descripcion");
            entity.Property(e => e.Fecha)
                .HasColumnType("date")
                .HasColumnName("fecha");
            entity.Property(e => e.PatenteId).HasColumnName("patente_id");
            entity.Property(e => e.UsuarioId)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("usuario_id");

            entity.HasOne(d => d.Patente).WithMany(p => p.PagosPatentes)
                .HasForeignKey(d => d.PatenteId)
                .HasConstraintName("FK_pagos_patente_patente_id");
        });

        modelBuilder.Entity<Pai>(entity =>
        {
            entity.HasKey(e => e.CodigoPais).HasName("PK__pais__8B321099F1D1FB7A");

            entity.ToTable("pais");

            entity.Property(e => e.CodigoPais)
                .HasMaxLength(4)
                .IsUnicode(false)
                .HasColumnName("codigo_pais");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<Patente>(entity =>
        {
            entity.HasKey(e => e.PatenteId).HasName("PK__patente__467D4F611668A2F4");

            entity.ToTable("patente");

            entity.Property(e => e.PatenteId).HasColumnName("patente_id");
            entity.Property(e => e.Abogado).HasColumnName("abogado");
            entity.Property(e => e.AbogadoInternacional)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("abogado_internacional");
            entity.Property(e => e.Activo).HasColumnName("activo");
            entity.Property(e => e.Caja)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("caja");
            entity.Property(e => e.Certificado)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("certificado");
            entity.Property(e => e.ClienteId).HasColumnName("cliente_id");
            entity.Property(e => e.CodigoPais)
                .HasMaxLength(4)
                .IsUnicode(false)
                .HasColumnName("codigo_pais");
            entity.Property(e => e.FechaPctPublicacion)
                .HasColumnType("date")
                .HasColumnName("fecha_pct_publicacion");
            entity.Property(e => e.FechaPctSolicitud)
                .HasColumnType("date")
                .HasColumnName("fecha_pct_solicitud");
            entity.Property(e => e.FechaPublicacion)
                .HasColumnType("date")
                .HasColumnName("fecha_publicacion");
            entity.Property(e => e.FechaRegistro)
                .HasColumnType("date")
                .HasColumnName("fecha_registro");
            entity.Property(e => e.OficinaTramitante).HasColumnName("oficina_tramitante");
            entity.Property(e => e.PagoAnualidad).HasColumnName("pago_anualidad");
            entity.Property(e => e.PagoAnualidadDesde)
                .HasColumnType("date")
                .HasColumnName("pago_anualidad_desde");
            entity.Property(e => e.PagoAnualidadHasta)
                .HasColumnType("date")
                .HasColumnName("pago_anualidad_hasta");
            entity.Property(e => e.PctPublicacion)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("pct_publicacion");
            entity.Property(e => e.PctSolicitud)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("pct_solicitud");
            entity.Property(e => e.Publicacion)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("publicacion");
            entity.Property(e => e.ReferenciaInterna)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("referencia_interna");
            entity.Property(e => e.Registro)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("registro");
            entity.Property(e => e.Resumen)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("resumen");
            entity.Property(e => e.TipoPatenteId).HasColumnName("tipo_patente_id");
            entity.Property(e => e.TituloEspanol)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("titulo_espanol");
            entity.Property(e => e.TituloIngles)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("titulo_ingles");
            entity.Property(e => e.Vencimiento)
                .HasColumnType("date")
                .HasColumnName("vencimiento");

            entity.HasOne(d => d.AbogadoNavigation).WithMany(p => p.Patentes)
                .HasForeignKey(d => d.Abogado)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_patente_abogado");

            entity.HasOne(d => d.Cliente).WithMany(p => p.PatenteClientes)
                .HasForeignKey(d => d.ClienteId)
                .HasConstraintName("FK_patente_cliente_id");

            entity.HasOne(d => d.CodigoPaisNavigation).WithMany(p => p.Patentes)
                .HasForeignKey(d => d.CodigoPais)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_patente_codigo_pais");

            entity.HasOne(d => d.OficinaTramitanteNavigation).WithMany(p => p.PatenteOficinaTramitanteNavigations)
                .HasForeignKey(d => d.OficinaTramitante)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_patente_oficina_tramitante");

            entity.HasOne(d => d.TipoPatente).WithMany(p => p.Patentes)
                .HasForeignKey(d => d.TipoPatenteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_patente_tipo_patente_id");
        });

        modelBuilder.Entity<PrioridadMarca>(entity =>
        {
            entity.HasKey(e => e.PrioridadMarcaId).HasName("PK__priorida__770E481CA4666ED1");

            entity.ToTable("prioridad_marca");

            entity.Property(e => e.PrioridadMarcaId).HasColumnName("prioridad_marca_id");
            entity.Property(e => e.CodigoPais)
                .HasMaxLength(4)
                .IsUnicode(false)
                .HasColumnName("codigo_pais");
            entity.Property(e => e.Fecha)
                .HasColumnType("date")
                .HasColumnName("fecha");
            entity.Property(e => e.MarcaId).HasColumnName("marca_id");
            entity.Property(e => e.Numero)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("numero");

            entity.HasOne(d => d.CodigoPaisNavigation).WithMany(p => p.PrioridadMarcas)
                .HasForeignKey(d => d.CodigoPais)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_prioridad_marca_codigo_pais");

            entity.HasOne(d => d.Marca).WithMany(p => p.PrioridadMarcas)
                .HasForeignKey(d => d.MarcaId)
                .HasConstraintName("FK_prioridad_marca_marca_id");
        });

        modelBuilder.Entity<PrioridadPatente>(entity =>
        {
            entity.HasKey(e => e.PrioridadPatenteId).HasName("PK__priorida__8EE97EB3D8133775");

            entity.ToTable("prioridad_patente");

            entity.Property(e => e.PrioridadPatenteId).HasColumnName("prioridad_patente_id");
            entity.Property(e => e.CodigoPais)
                .HasMaxLength(4)
                .IsUnicode(false)
                .HasColumnName("codigo_pais");
            entity.Property(e => e.Fecha)
                .HasColumnType("date")
                .HasColumnName("fecha");
            entity.Property(e => e.Numero)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("numero");
            entity.Property(e => e.PatenteId).HasColumnName("patente_id");

            entity.HasOne(d => d.CodigoPaisNavigation).WithMany(p => p.PrioridadPatentes)
                .HasForeignKey(d => d.CodigoPais)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_prioridad_patente_codigo_pais");

            entity.HasOne(d => d.Patente).WithMany(p => p.PrioridadPatentes)
                .HasForeignKey(d => d.PatenteId)
                .HasConstraintName("FK_prioridad_patente_patente_id");
        });

        modelBuilder.Entity<Propietario>(entity =>
        {
            entity.HasKey(e => e.PropietarioId).HasName("PK__propieta__3C57088441F92BA8");

            entity.ToTable("propietario");

            entity.Property(e => e.PropietarioId).HasColumnName("propietario_id");
            entity.Property(e => e.CodigoPais)
                .HasMaxLength(4)
                .IsUnicode(false)
                .HasColumnName("codigo_pais");
            entity.Property(e => e.FechaPoder)
                .HasColumnType("date")
                .HasColumnName("fecha_poder");
            entity.Property(e => e.General).HasColumnName("general");
            entity.Property(e => e.Nombre)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("nombre");
            entity.Property(e => e.Notas)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("notas");
            entity.Property(e => e.NumeroPoder)
                .HasMaxLength(40)
                .IsUnicode(false)
                .HasColumnName("numero_poder");
            entity.Property(e => e.Origen)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("origen");

            entity.HasOne(d => d.CodigoPaisNavigation).WithMany(p => p.Propietarios)
                .HasForeignKey(d => d.CodigoPais)
                .HasConstraintName("FK_propietario_codigo_pais");

            entity.HasMany(d => d.Abogados).WithMany(p => p.Propietarios)
                .UsingEntity<Dictionary<string, object>>(
                    "Apoderado",
                    r => r.HasOne<Abogado>().WithMany()
                        .HasForeignKey("AbogadoId")
                        .HasConstraintName("FK_apoderado_abogado_id"),
                    l => l.HasOne<Propietario>().WithMany()
                        .HasForeignKey("PropietarioId")
                        .HasConstraintName("FK_apoderado_propietario_id"),
                    j =>
                    {
                        j.HasKey("PropietarioId", "AbogadoId").HasName("PK__apoderad__FED19E40721278EA");
                        j.ToTable("apoderado");
                        j.IndexerProperty<int>("PropietarioId").HasColumnName("propietario_id");
                        j.IndexerProperty<int>("AbogadoId").HasColumnName("abogado_id");
                    });

            entity.HasMany(d => d.Patentes).WithMany(p => p.Propietarios)
                .UsingEntity<Dictionary<string, object>>(
                    "PropietarioPatente",
                    r => r.HasOne<Patente>().WithMany()
                        .HasForeignKey("PatenteId")
                        .HasConstraintName("FK_propietario_patente_patente_id"),
                    l => l.HasOne<Propietario>().WithMany()
                        .HasForeignKey("PropietarioId")
                        .HasConstraintName("FK_propietario_patente_propietario_id"),
                    j =>
                    {
                        j.HasKey("PropietarioId", "PatenteId").HasName("PK__propieta__3830DC7215F59AA5");
                        j.ToTable("propietario_patente");
                        j.IndexerProperty<int>("PropietarioId").HasColumnName("propietario_id");
                        j.IndexerProperty<int>("PatenteId").HasColumnName("patente_id");
                    });
        });

        modelBuilder.Entity<PublicacionAccion>(entity =>
        {
            entity.HasKey(e => e.PublicacionAccionId).HasName("PK__publicac__E1EC66DBF90A3A5C");

            entity.ToTable("publicacion_accion");

            entity.Property(e => e.PublicacionAccionId).HasColumnName("publicacion_accion_id");
            entity.Property(e => e.AccionTerceroId).HasColumnName("accion_tercero_id");
            entity.Property(e => e.NumeroGaceta).HasColumnName("numero_gaceta");
            entity.Property(e => e.Pagina)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("pagina");
            entity.Property(e => e.TipoPublicacionId).HasColumnName("tipo_publicacion_id");

            entity.HasOne(d => d.AccionTercero).WithMany(p => p.PublicacionAccions)
                .HasForeignKey(d => d.AccionTerceroId)
                .HasConstraintName("FK_publicacion_accion_accion_tercero_id");

            entity.HasOne(d => d.NumeroGacetaNavigation).WithMany(p => p.PublicacionAccions)
                .HasForeignKey(d => d.NumeroGaceta)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_publicacion_accion_numero_gaceta");

            entity.HasOne(d => d.TipoPublicacion).WithMany(p => p.PublicacionAccions)
                .HasForeignKey(d => d.TipoPublicacionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_publicacion_accion_tipo_publicacion_id");
        });

        modelBuilder.Entity<PublicacionMarca>(entity =>
        {
            entity.HasKey(e => e.PublicacionMarcaId).HasName("PK__publicac__D802EFF61AFB9DFD");

            entity.ToTable("publicacion_marca");

            entity.Property(e => e.PublicacionMarcaId).HasColumnName("publicacion_marca_id");
            entity.Property(e => e.MarcaId).HasColumnName("marca_id");
            entity.Property(e => e.NumeroGaceta).HasColumnName("numero_gaceta");
            entity.Property(e => e.Pagina)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("pagina");
            entity.Property(e => e.TipoPublicacionId).HasColumnName("tipo_publicacion_id");

            entity.HasOne(d => d.Marca).WithMany(p => p.PublicacionMarcas)
                .HasForeignKey(d => d.MarcaId)
                .HasConstraintName("FK_publicacion_marca_marca_id");

            entity.HasOne(d => d.NumeroGacetaNavigation).WithMany(p => p.PublicacionMarcas)
                .HasForeignKey(d => d.NumeroGaceta)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_publicacion_marca_numero_gaceta");

            entity.HasOne(d => d.TipoPublicacion).WithMany(p => p.PublicacionMarcas)
                .HasForeignKey(d => d.TipoPublicacionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_publicacion_marca_tipo_publicacion_id");
        });

        modelBuilder.Entity<PublicacionPatente>(entity =>
        {
            entity.HasKey(e => e.PublicacionPatenteId).HasName("PK__publicac__1BA06FBFEAAB9630");

            entity.ToTable("publicacion_patente");

            entity.Property(e => e.PublicacionPatenteId).HasColumnName("publicacion_patente_id");
            entity.Property(e => e.NumeroGaceta).HasColumnName("numero_gaceta");
            entity.Property(e => e.Pagina)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("pagina");
            entity.Property(e => e.PatenteId).HasColumnName("patente_id");
            entity.Property(e => e.TipoPublicacionId).HasColumnName("tipo_publicacion_id");

            entity.HasOne(d => d.NumeroGacetaNavigation).WithMany(p => p.PublicacionPatentes)
                .HasForeignKey(d => d.NumeroGaceta)
                .HasConstraintName("FK_publicacion_patente_numero_gaceta");

            entity.HasOne(d => d.Patente).WithMany(p => p.PublicacionPatentes)
                .HasForeignKey(d => d.PatenteId)
                .HasConstraintName("FK_publicacion_patente_patente_id");

            entity.HasOne(d => d.TipoPublicacion).WithMany(p => p.PublicacionPatentes)
                .HasForeignKey(d => d.TipoPublicacionId)
                .HasConstraintName("FK_publicacion_patente_tipo_publicacion_id");
        });

        modelBuilder.Entity<Recordatorio>(entity =>
        {
            entity.HasKey(e => e.RecordatorioId).HasName("PK__recordat__9271194ADC8A57B2");

            entity.ToTable("recordatorio");

            entity.Property(e => e.RecordatorioId).HasColumnName("recordatorio_id");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("descripcion");
            entity.Property(e => e.IdConexion).HasColumnName("id_conexion");
            entity.Property(e => e.TablaConexion)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("tabla_conexion");
        });

        modelBuilder.Entity<Referencium>(entity =>
        {
            entity.HasKey(e => e.ReferenciaId).HasName("PK__referenc__BB90AB416112AFBF");

            entity.ToTable("referencia");

            entity.Property(e => e.ReferenciaId).HasColumnName("referencia_id");
            entity.Property(e => e.Referencia)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("referencia");
            entity.Property(e => e.TipoReferenciaId).HasColumnName("tipo_referencia_id");

            entity.HasOne(d => d.TipoReferencia).WithMany(p => p.Referencia)
                .HasForeignKey(d => d.TipoReferenciaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_referencia_tipo_referencia_id");

            entity.HasMany(d => d.Infraccions).WithMany(p => p.Referencia)
                .UsingEntity<Dictionary<string, object>>(
                    "ReferenciaInfraccion",
                    r => r.HasOne<Infraccion>().WithMany()
                        .HasForeignKey("InfraccionId")
                        .HasConstraintName("FK_referencia_infraccion_infraccion_id"),
                    l => l.HasOne<Referencium>().WithMany()
                        .HasForeignKey("ReferenciaId")
                        .HasConstraintName("FK_referencia_infraccion_referencia_id"),
                    j =>
                    {
                        j.HasKey("ReferenciaId", "InfraccionId").HasName("PK__referenc__6793831163292659");
                        j.ToTable("referencia_infraccion");
                        j.IndexerProperty<int>("ReferenciaId").HasColumnName("referencia_id");
                        j.IndexerProperty<int>("InfraccionId").HasColumnName("infraccion_id");
                    });

            entity.HasMany(d => d.Patentes).WithMany(p => p.Referencia)
                .UsingEntity<Dictionary<string, object>>(
                    "ReferenciaPatente",
                    r => r.HasOne<Patente>().WithMany()
                        .HasForeignKey("PatenteId")
                        .HasConstraintName("FK_referencia_patente_patente_id"),
                    l => l.HasOne<Referencium>().WithMany()
                        .HasForeignKey("ReferenciaId")
                        .HasConstraintName("FK_referencia_patente_referencia_id"),
                    j =>
                    {
                        j.HasKey("ReferenciaId", "PatenteId").HasName("PK__referenc__BFF77FB7F96106C7");
                        j.ToTable("referencia_patente");
                        j.IndexerProperty<int>("ReferenciaId").HasColumnName("referencia_id");
                        j.IndexerProperty<int>("PatenteId").HasColumnName("patente_id");
                    });

            entity.HasMany(d => d.Regulatorios).WithMany(p => p.Referencia)
                .UsingEntity<Dictionary<string, object>>(
                    "ReferenciaRegulatorio",
                    r => r.HasOne<Regulatorio>().WithMany()
                        .HasForeignKey("RegulatorioId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_referencia_regulatorio_regulatorio_id"),
                    l => l.HasOne<Referencium>().WithMany()
                        .HasForeignKey("ReferenciaId")
                        .HasConstraintName("FK_referencia_regulatorio_referencia_id"),
                    j =>
                    {
                        j.HasKey("ReferenciaId", "RegulatorioId").HasName("PK__referenc__0930A0BF114E2190");
                        j.ToTable("referencia_regulatorio");
                        j.IndexerProperty<int>("ReferenciaId").HasColumnName("referencia_id");
                        j.IndexerProperty<int>("RegulatorioId").HasColumnName("regulatorio_id");
                    });
        });

        modelBuilder.Entity<Regulatorio>(entity =>
        {
            entity.HasKey(e => e.RegulatorioId).HasName("PK__regulato__2A00BFEA4CFC72E2");

            entity.ToTable("regulatorio");

            entity.Property(e => e.RegulatorioId).HasColumnName("regulatorio_id");
            entity.Property(e => e.Abogado).HasColumnName("abogado");
            entity.Property(e => e.Activo).HasColumnName("activo");
            entity.Property(e => e.ClienteId).HasColumnName("cliente_id");
            entity.Property(e => e.CodigoPais)
                .HasMaxLength(4)
                .IsUnicode(false)
                .HasColumnName("codigo_pais");
            entity.Property(e => e.EstadoId)
                .HasMaxLength(8)
                .IsUnicode(false)
                .HasColumnName("estado_id");
            entity.Property(e => e.FechaRegistro)
                .HasColumnType("date")
                .HasColumnName("fecha_registro");
            entity.Property(e => e.FechaVencimiento)
                .HasColumnType("date")
                .HasColumnName("fecha_vencimiento");
            entity.Property(e => e.GrupoId).HasColumnName("grupo_id");
            entity.Property(e => e.OficinaTramitante).HasColumnName("oficina_tramitante");
            entity.Property(e => e.ReferenciaInterna)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("referencia_interna");
            entity.Property(e => e.Registro)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("registro");
            entity.Property(e => e.Titulo)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("titulo");

            entity.HasOne(d => d.AbogadoNavigation).WithMany(p => p.Regulatorios)
                .HasForeignKey(d => d.Abogado)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_regulatorio_abogado");

            entity.HasOne(d => d.Cliente).WithMany(p => p.RegulatorioClientes)
                .HasForeignKey(d => d.ClienteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_regulatorio_cliente_id");

            entity.HasOne(d => d.CodigoPaisNavigation).WithMany(p => p.Regulatorios)
                .HasForeignKey(d => d.CodigoPais)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_regulatorio_codigo_pais");

            entity.HasOne(d => d.Estado).WithMany(p => p.Regulatorios)
                .HasForeignKey(d => d.EstadoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_regulatorio_estado_id");

            entity.HasOne(d => d.Grupo).WithMany(p => p.Regulatorios)
                .HasForeignKey(d => d.GrupoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_regulatorio_grupo_id");

            entity.HasOne(d => d.OficinaTramitanteNavigation).WithMany(p => p.RegulatorioOficinaTramitanteNavigations)
                .HasForeignKey(d => d.OficinaTramitante)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_regulatorio_oficina_tramitante");

            entity.HasMany(d => d.Propietarios).WithMany(p => p.Regulatorios)
                .UsingEntity<Dictionary<string, object>>(
                    "RegulatorioPropietario",
                    r => r.HasOne<Propietario>().WithMany()
                        .HasForeignKey("PropietarioId")
                        .HasConstraintName("FK_regulatorio_propietarios_propietario_id"),
                    l => l.HasOne<Regulatorio>().WithMany()
                        .HasForeignKey("RegulatorioId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_regulatorio_propietarios_regulatorio_id"),
                    j =>
                    {
                        j.HasKey("RegulatorioId", "PropietarioId").HasName("PK_regulatorio_propietario");
                        j.ToTable("regulatorio_propietarios");
                        j.IndexerProperty<int>("RegulatorioId").HasColumnName("regulatorio_id");
                        j.IndexerProperty<int>("PropietarioId").HasColumnName("propietario_id");
                    });
        });

        modelBuilder.Entity<RegulatorioFabricante>(entity =>
        {
            entity.HasKey(e => e.RegulatorioFabricanteId).HasName("PK__regulato__701813E2FF9FDC27");

            entity.ToTable("regulatorio_fabricante");

            entity.Property(e => e.RegulatorioFabricanteId).HasColumnName("regulatorio_fabricante_id");
            entity.Property(e => e.Ciudad)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("ciudad");
            entity.Property(e => e.CodigoPais)
                .HasMaxLength(4)
                .IsUnicode(false)
                .HasColumnName("codigo_pais");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("nombre");
            entity.Property(e => e.RegulatorioId).HasColumnName("regulatorio_id");

            entity.HasOne(d => d.CodigoPaisNavigation).WithMany(p => p.RegulatorioFabricantes)
                .HasForeignKey(d => d.CodigoPais)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_regulatorio_fabricante_codigo_pais");

            entity.HasOne(d => d.Regulatorio).WithMany(p => p.RegulatorioFabricantes)
                .HasForeignKey(d => d.RegulatorioId)
                .HasConstraintName("FK_regulatorio_fabricante_regulatorio_id");
        });

        modelBuilder.Entity<TipoAccion>(entity =>
        {
            entity.HasKey(e => e.TipoAccionId).HasName("PK__tipo_acc__8C011A79E92B0723");

            entity.ToTable("tipo_accion");

            entity.Property(e => e.TipoAccionId).HasColumnName("tipo_accion_id");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<TipoContactoCliente>(entity =>
        {
            entity.HasKey(e => e.TipoContactoClienteId).HasName("PK__tipo_con__E60ADE0B42540F68");

            entity.ToTable("tipo_contacto_cliente");

            entity.Property(e => e.TipoContactoClienteId).HasColumnName("tipo_contacto_cliente_id");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<TipoEstado>(entity =>
        {
            entity.HasKey(e => e.TipoEstadoId).HasName("PK__tipo_est__B306CF1903B60F0C");

            entity.ToTable("tipo_estado");

            entity.Property(e => e.TipoEstadoId)
                .HasMaxLength(8)
                .IsUnicode(false)
                .HasColumnName("tipo_estado_id");
            entity.Property(e => e.NombreEspanol)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("nombre_espanol");
            entity.Property(e => e.NombreIngles)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("nombre_ingles");
        });

        modelBuilder.Entity<TipoEvento>(entity =>
        {
            entity.HasKey(e => e.TipoEventoId).HasName("PK__tipo_eve__30CB549E7C8B79E2");

            entity.ToTable("tipo_evento");

            entity.Property(e => e.TipoEventoId)
                .ValueGeneratedNever()
                .HasColumnName("tipo_evento_id");
            entity.Property(e => e.Nombre)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("nombre");
            entity.Property(e => e.TablaEvento)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("tabla_evento");
        });

        modelBuilder.Entity<TipoInfraccion>(entity =>
        {
            entity.HasKey(e => e.TipoInfraccionId).HasName("PK__tipo_inf__4686C2C145E44B1A");

            entity.ToTable("tipo_infraccion");

            entity.Property(e => e.TipoInfraccionId).HasColumnName("tipo_infraccion_id");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<TipoMarca>(entity =>
        {
            entity.HasKey(e => e.TipoMarcaId).HasName("PK__tipo_mar__0C76105535BA8F5F");

            entity.ToTable("tipo_marca");

            entity.Property(e => e.TipoMarcaId).HasColumnName("tipo_marca_id");
            entity.Property(e => e.Nombre)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<TipoPatente>(entity =>
        {
            entity.HasKey(e => e.TipoPatenteId).HasName("PK__tipo_pat__B498005FC7CED479");

            entity.ToTable("tipo_patente");

            entity.Property(e => e.TipoPatenteId).HasColumnName("tipo_patente_id");
            entity.Property(e => e.Nombre)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<TipoPublicacion>(entity =>
        {
            entity.HasKey(e => e.TipoPublicacionId).HasName("PK__tipo_pub__3BB64B7AA2AE5578");

            entity.ToTable("tipo_publicacion");

            entity.Property(e => e.TipoPublicacionId).HasColumnName("tipo_publicacion_id");
            entity.Property(e => e.Nombre)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<TipoReferencium>(entity =>
        {
            entity.HasKey(e => e.TipoReferenciaId).HasName("PK__tipo_ref__1BAC7867ADBCC2FF");

            entity.ToTable("tipo_referencia");

            entity.Property(e => e.TipoReferenciaId).HasColumnName("tipo_referencia_id");
            entity.Property(e => e.Nombre)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<TipoSignoMarca>(entity =>
        {
            entity.HasKey(e => e.TipoSignoMarcaId).HasName("PK__tipo_sig__11FA0A7527A24828");

            entity.ToTable("tipo_signo_marca");

            entity.Property(e => e.TipoSignoMarcaId).HasColumnName("tipo_signo_marca_id");
            entity.Property(e => e.Nombre)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<TipoSistemaMarca>(entity =>
        {
            entity.HasKey(e => e.TipoSistemaMarcaId).HasName("PK__tipo_sis__B9D82AA3A8019AAD");

            entity.ToTable("tipo_sistema_marca");

            entity.Property(e => e.TipoSistemaMarcaId).HasColumnName("tipo_sistema_marca_id");
            entity.Property(e => e.Nombre)
                .HasMaxLength(70)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("PK__usuario__4E3E04AD97341C23");

            entity.ToTable("usuario");

            entity.Property(e => e.IdUsuario).HasColumnName("id_usuario");
            entity.Property(e => e.Apellido)
                .HasMaxLength(40)
                .IsUnicode(false)
                .HasColumnName("apellido");
            entity.Property(e => e.Correo)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("correo");
            entity.Property(e => e.Nombre)
                .HasMaxLength(40)
                .IsUnicode(false)
                .HasColumnName("nombre");

            entity.HasMany(d => d.Recordatorios).WithMany(p => p.IdUsuarios)
                .UsingEntity<Dictionary<string, object>>(
                    "UsuarioRecordatorio",
                    r => r.HasOne<Recordatorio>().WithMany()
                        .HasForeignKey("RecordatorioId")
                        .HasConstraintName("FK_Usuarios_Recordatorio_Recordatorio"),
                    l => l.HasOne<Usuario>().WithMany()
                        .HasForeignKey("IdUsuario")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_Usuarios_Recordatorio_Usuario"),
                    j =>
                    {
                        j.HasKey("IdUsuario", "RecordatorioId").HasName("PK__usuario___F7191539FF52F2E5");
                        j.ToTable("usuario_recordatorio");
                        j.IndexerProperty<int>("IdUsuario").HasColumnName("id_usuario");
                        j.IndexerProperty<int>("RecordatorioId").HasColumnName("recordatorio_id");
                    });
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
