package no.woodstk

import java.net.{URI, URL}
import javax.sql.DataSource

import org.postgresql.ds.PGSimpleDataSource
import unfiltered.jetty.Http

import scala.util.Properties

object Application extends App {

  val server = Http(Properties.envOrElse("PORT", "8081").toInt).resources(new URL(getClass().getResource("/www/"), "."))
  server.run()
}

trait DataSourceComponent {
  val dataSource: DataSource
}

object ComponentRegistry extends ArtistRepoComponent with DataSourceComponent {

  val dataSource : DataSource = {
    val databaseUrl : Option[String] = Option(System.getenv("DATABASE_URL"))
    databaseUrl match{
      case Some(value) => {
        val dbUrl = new URI(value)
        val ds = new PGSimpleDataSource
        ds.setUser(dbUrl.getUserInfo.split(":"){0})
        ds.setPassword(dbUrl.getUserInfo.split(":"){1})
        ds.setServerName(dbUrl.getHost)
        ds.setPortNumber(dbUrl.getPort)
        ds.setDatabaseName(dbUrl.getPath.tail) //remove leading slash
        ds
      }
      case None => {
        //fallback for dev
        val ds = new PGSimpleDataSource
        ds.setDatabaseName("ihfpeqhb")
        ds.setUser(Properties.envOrElse("DB_USER", "ihfpeqhb"))
        ds.setPassword(Properties.envOrElse("DB_PASSWORD", "cuTgG-yi4Lwo1Lhm7cR2cZKcfDhyov19"))
        ds.setServerName("horton.elephantsql.com")
        ds.setPortNumber(5432)
        ds
      }
    }
  }

  val artistRepo = new ArtistRepo
}
