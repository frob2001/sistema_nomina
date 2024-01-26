using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace webapi.Models;

public partial class SistemaNominaContext : DbContext
{
    public SistemaNominaContext()
    {
    }

    public SistemaNominaContext(DbContextOptions<SistemaNominaContext> options)
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
        => optionsBuilder.UseSqlServer("Server=FELICOMPU;Database=SistemaNomina;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Banco>(entity =>
        {
            entity.HasKey(e => e.BancoId).HasName("PK__Banco__4A8BAFF5A165D8E4");

            entity.ToTable("Banco");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<CentroCosto>(entity =>
        {
            entity.HasKey(e => e.CentroCostosId).HasName("PK__CentroCo__37ACA6F97EA7B1CE");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<Companium>(entity =>
        {
            entity.HasKey(e => e.CompaniaId).HasName("PK__Compania__DE6CF4B3BC838D34");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<Concepto>(entity =>
        {
            entity.HasKey(e => e.ConceptoId).HasName("PK__Concepto__BB30F135214D9251");

            entity.ToTable("Concepto");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<Emisor>(entity =>
        {
            entity.HasKey(e => e.EmisorId).HasName("PK__Emisor__E03A4804C6BB211A");

            entity.ToTable("Emisor");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<Empleado>(entity =>
        {
            entity.HasKey(e => e.EmpleadoId).HasName("PK__Empleado__958BE9102A0DD2DA");

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
                .HasConstraintName("FK__Empleado__BancoI__5DCAEF64");

            entity.HasOne(d => d.CentroCostos).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.CentroCostosId)
                .HasConstraintName("FK__Empleado__Centro__5CD6CB2B");

            entity.HasOne(d => d.Compania).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.CompaniaId)
                .HasConstraintName("FK__Empleado__Compan__571DF1D5");

            entity.HasOne(d => d.FondoReserva).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.FondoReservaId)
                .HasConstraintName("FK__Empleado__FondoR__5FB337D6");

            entity.HasOne(d => d.NivelSalarial).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.NivelSalarialId)
                .HasConstraintName("FK__Empleado__NivelS__5AEE82B9");

            entity.HasOne(d => d.Ocupacion).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.OcupacionId)
                .HasConstraintName("FK__Empleado__Ocupac__59FA5E80");

            entity.HasOne(d => d.TipoComision).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.TipoComisionId)
                .HasConstraintName("FK__Empleado__TipoCo__5BE2A6F2");

            entity.HasOne(d => d.TipoContrato).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.TipoContratoId)
                .HasConstraintName("FK__Empleado__TipoCo__59063A47");

            entity.HasOne(d => d.TipoCuenta).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.TipoCuentaId)
                .HasConstraintName("FK__Empleado__TipoCu__5EBF139D");

            entity.HasOne(d => d.TipoEmpleado).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.TipoEmpleadoId)
                .HasConstraintName("FK__Empleado__TipoEm__5812160E");
        });

        modelBuilder.Entity<FondoReserva>(entity =>
        {
            entity.HasKey(e => e.FondoReservaId).HasName("PK__FondoRes__340728611ADB2312");

            entity.ToTable("FondoReserva");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<MovimientosPlanilla>(entity =>
        {
            entity.HasKey(e => e.MovimientoId).HasName("PK__Movimien__BF923C2C9704EE82");

            entity.ToTable("MovimientosPlanilla");

            entity.Property(e => e.Importe)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("importe");

            entity.HasOne(d => d.Compania).WithMany(p => p.MovimientosPlanillas)
                .HasForeignKey(d => d.CompaniaId)
                .HasConstraintName("FK__Movimient__Compa__628FA481");

            entity.HasOne(d => d.Concepto).WithMany(p => p.MovimientosPlanillas)
                .HasForeignKey(d => d.ConceptoId)
                .HasConstraintName("FK__Movimient__Conce__6477ECF3");

            entity.HasOne(d => d.Empleado).WithMany(p => p.MovimientosPlanillas)
                .HasForeignKey(d => d.EmpleadoId)
                .HasConstraintName("FK__Movimient__Emple__6383C8BA");

            entity.HasOne(d => d.TipoOperacion).WithMany(p => p.MovimientosPlanillas)
                .HasForeignKey(d => d.TipoOperacionId)
                .HasConstraintName("FK__Movimient__TipoO__656C112C");
        });

        modelBuilder.Entity<NivelSalarial>(entity =>
        {
            entity.HasKey(e => e.NivelSalarialId).HasName("PK__NivelSal__E08BBE4E962C7705");

            entity.ToTable("NivelSalarial");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<Ocupacion>(entity =>
        {
            entity.HasKey(e => e.OcupacionId).HasName("PK__Ocupacio__77075F77886F9E50");

            entity.ToTable("Ocupacion");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<RolPago>(entity =>
        {
            entity.HasKey(e => e.RolPagoId).HasName("PK__RolPago__0FE6C8A57DEE8978");

            entity.ToTable("RolPago");

            entity.Property(e => e.FechaCreacion).HasColumnType("date");

            entity.HasOne(d => d.Compania).WithMany(p => p.RolPagos)
                .HasForeignKey(d => d.CompaniaId)
                .HasConstraintName("FK__RolPago__Compani__68487DD7");

            entity.HasOne(d => d.Usuario).WithMany(p => p.RolPagos)
                .HasForeignKey(d => d.UsuarioId)
                .HasConstraintName("FK__RolPago__Usuario__693CA210");
        });

        modelBuilder.Entity<Sucursal>(entity =>
        {
            entity.HasKey(e => e.SucursalId).HasName("PK__Sucursal__6CB482E18A90E0F3");

            entity.ToTable("Sucursal");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<TipoComision>(entity =>
        {
            entity.HasKey(e => e.TipoComisionId).HasName("PK__TipoComi__BC5F5913D4BE8592");

            entity.ToTable("TipoComision");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<TipoContrato>(entity =>
        {
            entity.HasKey(e => e.TipoContratoId).HasName("PK__TipoCont__3E0E5787F952B05C");

            entity.ToTable("TipoContrato");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<TipoCuentum>(entity =>
        {
            entity.HasKey(e => e.TipoCuentaId).HasName("PK__TipoCuen__B3998D148961AAF2");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<TipoEmpleado>(entity =>
        {
            entity.HasKey(e => e.TipoEmpleadoId).HasName("PK__TipoEmpl__0636C29B4DF83AE7");

            entity.ToTable("TipoEmpleado");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<TipoOperacion>(entity =>
        {
            entity.HasKey(e => e.TipoOperacionId).HasName("PK__TipoOper__72B4938169698894");

            entity.ToTable("TipoOperacion");

            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.UsuarioId).HasName("PK__Usuario__2B3DE7B8CCD15981");

            entity.ToTable("Usuario");

            entity.HasIndex(e => e.CorreoElectronico, "UQ__Usuario__531402F30AA9D732").IsUnique();

            entity.Property(e => e.Contrasena).HasMaxLength(255);
            entity.Property(e => e.CorreoElectronico).HasMaxLength(255);
            entity.Property(e => e.Nombre).HasMaxLength(255);

            entity.HasOne(d => d.Emisor).WithMany(p => p.Usuarios)
                .HasForeignKey(d => d.EmisorId)
                .HasConstraintName("FK__Usuario__EmisorI__3C69FB99");

            entity.HasOne(d => d.Sucursal).WithMany(p => p.Usuarios)
                .HasForeignKey(d => d.SucursalId)
                .HasConstraintName("FK__Usuario__Sucursa__3D5E1FD2");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
