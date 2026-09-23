using CanSat_Tecnm.Models;
using Microsoft.EntityFrameworkCore;

namespace CanSat_Tecnm.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
        public DbSet<Telemetria> RegistrosTelemetria { get; set; }
    }
}