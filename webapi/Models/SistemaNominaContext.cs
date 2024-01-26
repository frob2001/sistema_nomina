using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace webapi.Models;

public partial class SistemanominaContext : DbContext
{
    public SistemanominaContext()
    {
    }

    public SistemanominaContext(DbContextOptions<SistemanominaContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Banco> Bancos { get; set; }

    public virtual DbSet<CentroCosto> CentroCostos { get; set; }

    public virtual DbSet<Companium> Compania { get; set; }

    public virtual DbSet<Concepto> Conceptos { get; set; }

    public virtual DbSet<Emisor> Emisors { get; set; }

    public virtual DbSet<Empleado> Empleados { get; set; }

    public virtual DbSet<FondoReserva> FondoReservas { get; set; }

    public virtual DbSet<MovimientosPlanilla> MovimientosPlanillas { get; set; }

    public virtual DbSet<NivelSalarial> NivelSalarials { get; set; }

    public virtual DbSet<Ocupacion> Ocupacions { get; set; }

    public virtual DbSet<RolPago> RolPagos { get; set; }

    public virtual DbSet<Sucursal> Sucursals { get; set; }

    public virtual DbSet<TipoComision> TipoComisions { get; set; }

    public virtual DbSet<TipoContrato> TipoContratos { get; set; }

    public virtual DbSet<TipoCuentum> TipoCuenta { get; set; }

    public virtual DbSet<TipoEmpleado> TipoEmpleados { get; set; }

    public virtual DbSet<TipoOperacion> TipoOperacions { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=tcp:sistemanomina.database.windows.net,1433;Initial Catalog=sistemanomina;Persist Security Info=False;User ID=sistemanomina;Password=nomina25sistema18!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Banco>(entity =>
        {
            entity.HasKey(e => e.BancoId).HasName("PK__Banco__4A8BAFF5209E4DCE");

            entity.ToTable("Banco");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<CentroCosto>(entity =>
        {
            entity.HasKey(e => e.CentroCostosId).HasName("PK__CentroCo__37ACA6F9E44EEE4A");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<Companium>(entity =>
        {
            entity.HasKey(e => e.CompaniaId).HasName("PK__Compania__DE6CF4B3004CCB44");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<Concepto>(entity =>
        {
            entity.HasKey(e => e.ConceptoId).HasName("PK__Concepto__BB30F1355A33F539");

            entity.ToTable("Concepto");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<Emisor>(entity =>
        {
            entity.HasKey(e => e.EmisorId).HasName("PK__Emisor__E03A480477F23633");

            entity.ToTable("Emisor");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<Empleado>(entity =>
        {
            entity.HasKey(e => e.EmpleadoId).HasName("PK__Empleado__958BE910C20B487B");

            entity.ToTable("Empleado");

            entity.Property(e => e.ApellidoMaterno).HasMaxLength(255);
            entity.Property(e => e.ApellidoPaterno).HasMaxLength(255);
            entity.Property(e => e.Bonificacion).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.CarnetIess)
                .HasMaxLength(50)
                .HasColumnName("CarnetIESS");
            entity.Property(e => e.CuentaBancaria).HasMaxLength(50);
            entity.Property(e => e.Direccion).HasMaxLength(255);
            entity.Property(e => e.FechaIngreso).HasColumnType("date");
            entity.Property(e => e.FechaNacimiento).HasColumnType("date");
            entity.Property(e => e.FechaReingreso).HasColumnType("date");
            entity.Property(e => e.FormaCalculo13).HasMaxLength(50);
            entity.Property(e => e.FormaCalculo14).HasMaxLength(50);
            entity.Property(e => e.Nombres).HasMaxLength(255);
            entity.Property(e => e.NumeroCedula).HasMaxLength(10);
            entity.Property(e => e.Sexo)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength();
            entity.Property(e => e.SueldoBase).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.Telefono1).HasMaxLength(50);
            entity.Property(e => e.Telefono2).HasMaxLength(50);

            entity.HasOne(d => d.Banco).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.BancoId)
                .HasConstraintName("FK__Empleado__BancoI__02FC7413");

            entity.HasOne(d => d.CentroCostos).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.CentroCostosId)
                .HasConstraintName("FK__Empleado__Centro__02084FDA");

            entity.HasOne(d => d.Compania).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.CompaniaId)
                .HasConstraintName("FK__Empleado__Compan__7C4F7684");

            entity.HasOne(d => d.FondoReserva).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.FondoReservaId)
                .HasConstraintName("FK__Empleado__FondoR__04E4BC85");

            entity.HasOne(d => d.NivelSalarial).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.NivelSalarialId)
                .HasConstraintName("FK__Empleado__NivelS__00200768");

            entity.HasOne(d => d.Ocupacion).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.OcupacionId)
                .HasConstraintName("FK__Empleado__Ocupac__7F2BE32F");

            entity.HasOne(d => d.TipoComision).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.TipoComisionId)
                .HasConstraintName("FK__Empleado__TipoCo__01142BA1");

            entity.HasOne(d => d.TipoContrato).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.TipoContratoId)
                .HasConstraintName("FK__Empleado__TipoCo__7E37BEF6");

            entity.HasOne(d => d.TipoCuenta).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.TipoCuentaId)
                .HasConstraintName("FK__Empleado__TipoCu__03F0984C");

            entity.HasOne(d => d.TipoEmpleado).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.TipoEmpleadoId)
                .HasConstraintName("FK__Empleado__TipoEm__7D439ABD");
        });

        modelBuilder.Entity<FondoReserva>(entity =>
        {
            entity.HasKey(e => e.FondoReservaId).HasName("PK__FondoRes__340728619652816D");

            entity.ToTable("FondoReserva");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<MovimientosPlanilla>(entity =>
        {
            entity.HasKey(e => e.MovimientoId).HasName("PK__Movimien__BF923C2C156C928A");

            entity.ToTable("MovimientosPlanilla");

            entity.Property(e => e.Importe)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("importe");

            entity.HasOne(d => d.Compania).WithMany(p => p.MovimientosPlanillas)
                .HasForeignKey(d => d.CompaniaId)
                .HasConstraintName("FK__Movimient__Compa__07C12930");

            entity.HasOne(d => d.Concepto).WithMany(p => p.MovimientosPlanillas)
                .HasForeignKey(d => d.ConceptoId)
                .HasConstraintName("FK__Movimient__Conce__09A971A2");

            entity.HasOne(d => d.Empleado).WithMany(p => p.MovimientosPlanillas)
                .HasForeignKey(d => d.EmpleadoId)
                .HasConstraintName("FK__Movimient__Emple__08B54D69");

            entity.HasOne(d => d.TipoOperacion).WithMany(p => p.MovimientosPlanillas)
                .HasForeignKey(d => d.TipoOperacionId)
                .HasConstraintName("FK__Movimient__TipoO__0A9D95DB");
        });

        modelBuilder.Entity<NivelSalarial>(entity =>
        {
            entity.HasKey(e => e.NivelSalarialId).HasName("PK__NivelSal__E08BBE4EF2A7B857");

            entity.ToTable("NivelSalarial");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<Ocupacion>(entity =>
        {
            entity.HasKey(e => e.OcupacionId).HasName("PK__Ocupacio__77075F772770AE7B");

            entity.ToTable("Ocupacion");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<RolPago>(entity =>
        {
            entity.HasKey(e => e.RolPagoId).HasName("PK__RolPago__0FE6C8A5CA969477");

            entity.ToTable("RolPago");

            entity.Property(e => e.FechaCreacion).HasColumnType("date");

            entity.HasOne(d => d.Compania).WithMany(p => p.RolPagos)
                .HasForeignKey(d => d.CompaniaId)
                .HasConstraintName("FK__RolPago__Compani__0D7A0286");

            entity.HasOne(d => d.Usuario).WithMany(p => p.RolPagos)
                .HasForeignKey(d => d.UsuarioId)
                .HasConstraintName("FK__RolPago__Usuario__0E6E26BF");
        });

        modelBuilder.Entity<Sucursal>(entity =>
        {
            entity.HasKey(e => e.SucursalId).HasName("PK__Sucursal__6CB482E1E225D887");

            entity.ToTable("Sucursal");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<TipoComision>(entity =>
        {
            entity.HasKey(e => e.TipoComisionId).HasName("PK__TipoComi__BC5F5913331F443A");

            entity.ToTable("TipoComision");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<TipoContrato>(entity =>
        {
            entity.HasKey(e => e.TipoContratoId).HasName("PK__TipoCont__3E0E5787AE3A1C8D");

            entity.ToTable("TipoContrato");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<TipoCuentum>(entity =>
        {
            entity.HasKey(e => e.TipoCuentaId).HasName("PK__TipoCuen__B3998D14C9BB76E5");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<TipoEmpleado>(entity =>
        {
            entity.HasKey(e => e.TipoEmpleadoId).HasName("PK__TipoEmpl__0636C29BB2648F6E");

            entity.ToTable("TipoEmpleado");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<TipoOperacion>(entity =>
        {
            entity.HasKey(e => e.TipoOperacionId).HasName("PK__TipoOper__72B49381C1E9CA96");

            entity.ToTable("TipoOperacion");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.UsuarioId).HasName("PK__Usuario__2B3DE7B88C122D2E");

            entity.ToTable("Usuario");

            entity.HasIndex(e => e.CorreoElectronico, "UQ__Usuario__531402F3D31D170F").IsUnique();

            entity.Property(e => e.Contrasena).HasMaxLength(255);
            entity.Property(e => e.CorreoElectronico).HasMaxLength(255);
            entity.Property(e => e.Nombre).HasMaxLength(255);

            entity.HasOne(d => d.Emisor).WithMany(p => p.Usuarios)
                .HasForeignKey(d => d.EmisorId)
                .HasConstraintName("FK__Usuario__EmisorI__619B8048");

            entity.HasOne(d => d.Sucursal).WithMany(p => p.Usuarios)
                .HasForeignKey(d => d.SucursalId)
                .HasConstraintName("FK__Usuario__Sucursa__628FA481");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
